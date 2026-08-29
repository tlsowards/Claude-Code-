"""Pull one week of discussion activity from Canvas into a drafting bundle.

This script only reads. It gathers the threads that need an instructor
response and writes them to a JSON bundle; Claude drafts from that bundle,
and a human posts the result.

    python3 -m canvas_weekly.fetch_week --school chico --days 7
"""

from __future__ import annotations

import argparse
import datetime as dt
import html
import json
import pathlib
import re
import sys

from .canvas_client import CanvasClient, CanvasError

ROOT = pathlib.Path(__file__).resolve().parent.parent
TAG_RE = re.compile(r"<[^>]+>")


def strip_html(raw: str | None) -> str:
    """Canvas returns entry bodies as HTML; drafting reads better as text."""
    if not raw:
        return ""
    text = re.sub(r"<br\s*/?>|</p>", "\n", raw, flags=re.I)
    text = html.unescape(TAG_RE.sub("", text))
    return re.sub(r"\n{3,}", "\n\n", text).strip()


def parse_ts(value: str | None) -> dt.datetime | None:
    if not value:
        return None
    try:
        return dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


def load_config(path: pathlib.Path) -> dict:
    if not path.exists():
        raise SystemExit(
            f"missing {path}. Copy config.example.json to config.json and fill in "
            f"your base URLs and course IDs."
        )
    return json.loads(path.read_text())


def walk(entries: list, parent_author: str | None = None, depth: int = 0):
    """Yield (entry, parent_author, depth) over the nested reply tree."""
    for entry in entries or []:
        if entry.get("deleted"):
            continue
        yield entry, parent_author, depth
        yield from walk(entry.get("replies"), entry.get("_author"), depth + 1)


def subtree_has_author(entry: dict, user_id: int) -> bool:
    for reply in entry.get("replies") or []:
        if reply.get("user_id") == user_id or subtree_has_author(reply, user_id):
            return True
    return False


def collect_topic(client, course, topic, me_id, cutoff) -> dict | None:
    view = client.topic_view(course["id"], topic["id"])
    names = {p["id"]: p.get("display_name") or p.get("name") or f"user {p['id']}"
             for p in view.get("participants") or []}

    roots = view.get("view") or []
    for entry, _, _ in walk(roots):
        entry["_author"] = names.get(entry.get("user_id"), "unknown")

    needs_reply, context = [], []
    for entry, parent_author, depth in walk(roots):
        created = parse_ts(entry.get("created_at"))
        record = {
            "entry_id": entry.get("id"),
            "author": entry.get("_author"),
            "author_id": entry.get("user_id"),
            "created_at": entry.get("created_at"),
            "depth": depth,
            "replying_to": parent_author,
            "message": strip_html(entry.get("message")),
        }
        context.append(record)
        if entry.get("user_id") == me_id:
            continue
        if created and created < cutoff:
            continue
        if subtree_has_author(entry, me_id):
            continue
        needs_reply.append(record)

    if not needs_reply:
        return None

    return {
        "course_id": course["id"],
        "course_name": course.get("name", str(course["id"])),
        "topic_id": topic["id"],
        "topic_title": topic.get("title", ""),
        "topic_url": topic.get("html_url", ""),
        "topic_prompt": strip_html(topic.get("message")),
        "posted_at": topic.get("posted_at"),
        "entry_count": len(context),
        "needs_reply": needs_reply,
        "thread": context,
    }


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--school", required=True, help="school id from config.json")
    ap.add_argument("--days", type=int, default=7, help="lookback window (default 7)")
    ap.add_argument("--config", default=str(ROOT / "config.json"))
    ap.add_argument("--out", default=None, help="bundle path (default bundles/<school>-<date>.json)")
    args = ap.parse_args(argv)

    config = load_config(pathlib.Path(args.config))
    schools = {s["id"]: s for s in config.get("schools", [])}
    if args.school not in schools:
        raise SystemExit(f"unknown school {args.school!r}; have {sorted(schools)}")
    school = schools[args.school]

    client = CanvasClient.from_school(school)
    try:
        me = client.whoami()
    except CanvasError as exc:
        print(f"could not authenticate to {school['base_url']}: {exc}", file=sys.stderr)
        return 1
    me_id = me["id"]

    cutoff = dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=args.days)
    topics_out, skipped = [], 0

    for course in school.get("courses", []):
        for topic in client.discussion_topics(course["id"]):
            last = parse_ts(topic.get("last_reply_at")) or parse_ts(topic.get("posted_at"))
            if last and last < cutoff:
                skipped += 1
                continue
            collected = collect_topic(client, course, topic, me_id, cutoff)
            if collected:
                topics_out.append(collected)

    bundle = {
        "school_id": school["id"],
        "school_name": school.get("name", school["id"]),
        "base_url": school["base_url"],
        "instructor": {"id": me_id, "name": me.get("name")},
        "window_days": args.days,
        "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "topics": topics_out,
    }

    out = pathlib.Path(args.out) if args.out else (
        ROOT / "bundles" / f"{school['id']}-{dt.date.today().isoformat()}.json"
    )
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(bundle, indent=2))

    pending = sum(len(t["needs_reply"]) for t in topics_out)
    print(f"{bundle['school_name']}: {len(topics_out)} active topic(s), "
          f"{pending} post(s) awaiting a reply ({skipped} stale topic(s) skipped)")
    print(f"bundle -> {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
