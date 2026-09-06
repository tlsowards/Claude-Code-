"""Score a discussion thread against a posting rubric.

Counts each student's posts, the distinct days they posted on, and the words
in each post, then applies the rubric. Writes a CSV for gradebook entry and
prints a per-student breakdown, so every score can be traced to what the
student actually did.

    python3 -m canvas_weekly.grade_week --bundle b.json --posts 3 --days 3 \
        --total 21 --min-words 250

Nothing here posts a grade to Canvas. It produces numbers for a human to
enter and, more importantly, to disagree with.
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import json
import pathlib
import re
import sys
from zoneinfo import ZoneInfo


def parse_ts(value: str | None):
    if not value:
        return None
    try:
        return dt.datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None


def word_count(text: str) -> int:
    return len([w for w in re.split(r"\s+", (text or "").strip()) if w])


def grade_student(posts: list[dict], rubric: dict) -> dict:
    """Score one student's posts. Returns the score and the reasoning behind it."""
    tz = ZoneInfo(rubric["timezone"])
    required_posts = rubric["required_posts"]
    required_days = rubric["required_days"]
    total = rubric["total_points"]
    min_words = rubric["min_words"]
    per_post = total / required_posts

    days = set()
    detail = []
    earned = 0.0
    for post in posts:
        stamp = parse_ts(post.get("created_at"))
        day = stamp.astimezone(tz).date().isoformat() if stamp else None
        if day:
            days.add(day)
        words = word_count(post.get("message"))
        # A short post earns its share of the per-post value, never more.
        ratio = 1.0 if words >= min_words else (words / min_words if min_words else 1.0)
        credit = per_post * ratio
        earned += credit
        detail.append({"day": day, "words": words, "credit": round(credit, 1),
                       "short": words < min_words})

    # Extra posts beyond the requirement don't add points.
    earned = min(earned, total)

    counted_days = len(days)
    unknown_days = any(d["day"] is None for d in detail)
    met_posts = len(posts) >= required_posts
    met_days = counted_days >= required_days or unknown_days

    flags = []
    if not met_posts:
        flags.append(f"{len(posts)} of {required_posts} posts")
    if not met_days and not unknown_days:
        flags.append(f"posted on {counted_days} day(s), {required_days} required")
    if unknown_days:
        flags.append("some posts have no timestamp; day rule not checked")
    short = [d for d in detail if d["short"]]
    if short:
        flags.append(f"{len(short)} post(s) under {min_words} words")

    # The day requirement is separate from the post count: meeting one does
    # not excuse the other, so a same-day burst loses the day-rule share.
    if not met_days and not unknown_days and required_days > 1:
        shortfall = (required_days - counted_days) / required_days
        earned *= max(0.0, 1 - shortfall * rubric["day_weight"])

    return {"posts": len(posts), "days": counted_days, "detail": detail,
            "score": round(min(earned, total), 1), "flags": flags,
            "full_credit": met_posts and met_days and not short}


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--bundle", required=True)
    ap.add_argument("--posts", type=int, required=True, help="posts required for full credit")
    ap.add_argument("--days", type=int, required=True, help="distinct days required")
    ap.add_argument("--total", type=float, required=True, help="points the discussion is worth")
    ap.add_argument("--min-words", type=int, default=250)
    ap.add_argument("--timezone", default="America/Los_Angeles")
    # Default 0: score purely per post, which is the stated rubric. The day
    # requirement is reported as a flag for the instructor to act on, not
    # silently deducted. Raise it to make missed days cost points.
    ap.add_argument("--day-weight", type=float, default=0.0,
                    help="how much a missed day-spread rule reduces the score "
                         "(0-1, default 0 = report only, no deduction)")
    ap.add_argument("--out", default=None, help="CSV path")
    args = ap.parse_args(argv)

    bundle = json.loads(pathlib.Path(args.bundle).read_text())
    rubric = {"required_posts": args.posts, "required_days": args.days,
              "total_points": args.total, "min_words": args.min_words,
              "timezone": args.timezone, "day_weight": args.day_weight}

    me = (bundle.get("instructor") or {}).get("id")
    by_student: dict[str, list] = {}
    for topic in bundle.get("topics", []):
        for entry in topic.get("thread", []):
            if me is not None and entry.get("author_id") == me:
                continue
            by_student.setdefault(entry.get("author") or "unknown", []).append(entry)

    if not by_student:
        print("no student posts found in this bundle", file=sys.stderr)
        return 1

    rows = []
    print(f"Rubric: {args.posts} posts on {args.days} separate day(s), "
          f"{args.min_words}+ words each, {args.total} points, {args.timezone}\n")
    for name in sorted(by_student):
        r = grade_student(by_student[name], rubric)
        rows.append({"student": name, "score": r["score"], "posts": r["posts"],
                     "days": r["days"],
                     "words": "|".join(str(d["words"]) for d in r["detail"]),
                     "dates": "|".join(d["day"] or "?" for d in r["detail"]),
                     "notes": "; ".join(r["flags"])})
        mark = "full" if r["full_credit"] else "    "
        print(f"  {mark} {r['score']:>5} / {args.total:<5} {name}")
        print(f"        {r['posts']} post(s) on {r['days']} day(s); "
              f"words {', '.join(str(d['words']) for d in r['detail'])}")
        for flag in r["flags"]:
            print(f"        - {flag}")

    out = pathlib.Path(args.out) if args.out else (
        pathlib.Path(__file__).resolve().parent.parent / "grades" /
        f"{bundle.get('school_id','course')}-{dt.date.today().isoformat()}.csv")
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
    print(f"\n{len(rows)} student(s) -> {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
