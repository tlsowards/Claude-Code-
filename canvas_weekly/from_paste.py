"""Build a drafting bundle from pasted discussion text -- no Canvas API needed.

When an institution disables instructor access tokens, copy the thread out of
Canvas into a text file and run this. It produces the same bundle that
fetch_week.py produces, so drafting and the review page work unchanged.

Format (headers are per-topic; repeat the block for more topics):

    COURSE: ECON 103 - Microeconomics
    TOPIC: Week 4: Is a monopoly ever good for consumers?
    URL: https://school.instructure.com/courses/900/discussion_topics/11
    ME: Terry Sowards
    PROMPT: Read Ch. 7, then argue a position with evidence.

    --- Dana R.
    Natural monopolies in utilities lower costs.

      --- Priya K.
      But evergreening extends them past the incentive.

Every `---` line starts a post; the rest of the line is the author. Indent the
marker two spaces per level of reply nesting. `ME:` marks your own name, so your
posts count as context and the threads you already answered are left alone.
`URL:` and `PROMPT:` are optional but both improve the drafts.

    python3 -m canvas_weekly.from_paste --in week4.txt --school-name "Chico"
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
HEADER_RE = re.compile(r"^(COURSE|TOPIC|URL|ME|PROMPT)\s*:\s*(.*)$", re.I)
MARKER_RE = re.compile(r"^(\s*)---\s*(.*?)\s*$")


def flush(post: dict | None, buf: list, out: list) -> None:
    if post is None:
        return
    post["message"] = "\n".join(buf).strip()
    if post["message"] or post["author"]:
        out.append(post)


def parse(text: str) -> list[dict]:
    """Split the file into topic blocks, each with its ordered posts."""
    topics: list[dict] = []
    current: dict | None = None
    post: dict | None = None
    buf: list[str] = []
    next_id = 1

    def new_topic() -> dict:
        return {"course_name": "", "topic_title": "", "topic_url": "",
                "me": "", "topic_prompt": "", "posts": []}

    for line in text.splitlines():
        header = HEADER_RE.match(line.strip())
        if header and not MARKER_RE.match(line):
            key, value = header.group(1).upper(), header.group(2).strip()
            # A second TOPIC: header starts a new block.
            if current is None or (key == "TOPIC" and current["topic_title"]):
                flush(post, buf, current["posts"]) if current else None
                post, buf = None, []
                current = new_topic()
                topics.append(current)
            field = {"COURSE": "course_name", "TOPIC": "topic_title",
                     "URL": "topic_url", "ME": "me", "PROMPT": "topic_prompt"}[key]
            current[field] = (current[field] + " " + value).strip() if current[field] and field == "topic_prompt" else value
            continue

        marker = MARKER_RE.match(line)
        if marker:
            if current is None:
                current = new_topic()
                topics.append(current)
            flush(post, buf, current["posts"])
            buf = []
            post = {"entry_id": next_id, "author": marker.group(2) or "unknown",
                    "depth": len(marker.group(1)) // 2}
            next_id += 1
            continue

        if post is not None:
            buf.append(line)
        elif current is not None and current["topic_prompt"] and line.strip():
            current["topic_prompt"] += "\n" + line.strip()

    if current is not None:
        flush(post, buf, current["posts"])
    return [t for t in topics if t["posts"]]


def to_bundle(topics: list[dict], school_name: str, days: int) -> dict:
    out_topics = []
    for index, topic in enumerate(topics, start=1):
        me = (topic.get("me") or "").strip().lower()
        posts = topic["posts"]

        thread = []
        for position, post in enumerate(posts):
            # The nearest preceding post one level shallower is the parent.
            parent = next((posts[j]["author"] for j in range(position - 1, -1, -1)
                           if posts[j]["depth"] < post["depth"]), None)
            thread.append({**post, "author_id": None, "created_at": "",
                           "replying_to": parent})

        needs = []
        for position, post in enumerate(thread):
            if me and post["author"].strip().lower() == me:
                continue
            # Answered if any deeper post before the next same-or-shallower one is mine.
            answered = False
            for later in thread[position + 1:]:
                if later["depth"] <= post["depth"]:
                    break
                if me and later["author"].strip().lower() == me:
                    answered = True
                    break
            if not answered:
                needs.append(post)

        out_topics.append({
            "course_id": 0,
            "course_name": topic.get("course_name") or "",
            "topic_id": index,
            "topic_title": topic.get("topic_title") or f"Discussion {index}",
            "topic_url": topic.get("topic_url") or "",
            "topic_prompt": topic.get("topic_prompt") or "",
            "posted_at": "",
            "entry_count": len(thread),
            "needs_reply": needs,
            "thread": thread,
        })

    return {
        "school_id": "paste",
        "school_name": school_name,
        "base_url": "",
        "source": "pasted text (no Canvas API)",
        "instructor": {"id": None, "name": topics[0].get("me") if topics else None},
        "window_days": days,
        "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "topics": out_topics,
    }


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--in", dest="src", required=True, help="pasted discussion text")
    ap.add_argument("--school-name", default="Course")
    ap.add_argument("--out", default=None)
    args = ap.parse_args(argv)

    text = pathlib.Path(args.src).read_text()
    topics = parse(text)
    if not topics:
        raise SystemExit(
            "no posts found. Every post needs a line starting with '---' followed "
            "by the author's name. See the format in this module's docstring."
        )
    bundle = to_bundle(topics, args.school_name, 7)

    out = pathlib.Path(args.out) if args.out else (
        ROOT / "bundles" / f"paste-{dt.date.today().isoformat()}.json")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(bundle, indent=2))

    pending = sum(len(t["needs_reply"]) for t in bundle["topics"])
    print(f"{len(bundle['topics'])} topic(s), {pending} post(s) awaiting a reply")
    print(f"bundle -> {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
