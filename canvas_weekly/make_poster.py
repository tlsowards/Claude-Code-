"""Generate the browser script that posts the drafts to Canvas.

Emits a self-contained snippet to paste into the console on the discussion
page. It posts through Canvas's API using your existing session and CSRF
token, so no personal access token is involved.

    python3 -m canvas_weekly.make_poster --bundle b.json --drafts d.json --out post.js
"""

from __future__ import annotations

import argparse
import html
import json
import pathlib
import re

TEMPLATE = """// Generated for: %(title)s
// Course %(course)s / topic %(topic)s on %(origin)s
//
// Paste into the browser console on that discussion page. Posts %(count)d
// reply(ies) as you. Chrome blocks console pasting until you type
// "allow pasting" once per session.
//
// Re-running is safe: it re-reads the thread first and skips any post you
// have already replied to, so a double paste will not double post.

(async () => {
  const DRAFTS = %(drafts)s;
  const COURSE = %(course)s, TOPIC = %(topic)s;
  const base = `/api/v1/courses/${COURSE}/discussion_topics/${TOPIC}`;

  const expected = %(origin)s;
  if (location.origin !== expected || !location.pathname.includes(`/discussion_topics/${TOPIC}`)) {
    return console.error(`Wrong page. Open ${expected}/courses/${COURSE}/discussion_topics/${TOPIC}`);
  }

  const csrf = decodeURIComponent(
    (document.cookie.match(/(?:^|;\\s*)_csrf_token=([^;]+)/) || [])[1] || '');
  if (!csrf) return console.error('No CSRF token found - are you logged in on this page?');

  const get = async (p) => {
    const r = await fetch(p, { credentials: 'same-origin', headers: { Accept: 'application/json' } });
    if (!r.ok) throw new Error(`${p} -> HTTP ${r.status}`);
    return JSON.parse((await r.text()).replace(/^while\\(1\\);/, ''));
  };

  // Re-read the thread so an already-answered post is never replied to twice.
  const [me, view] = await Promise.all([get('/api/v1/users/self'), get(`${base}/view`)]);
  const mine = new Set();
  const walk = (list, parentIds) => {
    for (const e of list || []) {
      if (e.user_id === me.id) parentIds.forEach((id) => mine.add(id));
      walk(e.replies, [...parentIds, e.id]);
    }
  };
  walk(view.view, []);

  let posted = 0, skipped = 0, failed = 0;
  for (const d of DRAFTS) {
    if (mine.has(d.entry_id)) {
      console.log(`skip   ${d.author} - already replied`);
      skipped++;
      continue;
    }
    try {
      const res = await fetch(`${base}/entries/${d.entry_id}/replies`, {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
        body: JSON.stringify({ message: d.message }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
      console.log(`posted ${d.author}`);
      posted++;
    } catch (err) {
      console.error(`FAILED ${d.author}:`, err.message);
      failed++;
    }
    await new Promise((r) => setTimeout(r, 700)); // stay under Canvas throttling
  }

  console.log(`done - ${posted} posted, ${skipped} skipped, ${failed} failed.`);
  if (posted) console.log('Reload the page to see them.');
})();
"""


def build_messages(bundle: dict, drafts: dict) -> list[dict]:
    """Combine each draft with its probing question into one reply body."""
    authors = {e["entry_id"]: e.get("author")
               for t in bundle.get("topics", []) for e in t.get("needs_reply", [])}
    out = []
    for reply in drafts.get("replies", []):
        body = (reply.get("draft") or "").strip()
        question = (reply.get("probing_question") or "").strip()
        if question:
            body = f"{body}\n\n{question}" if body else question
        if not body:
            continue
        # Canvas renders entries as HTML, so paragraph-wrap rather than send \n --
        # and escape first, since this is the one place text goes out to students.
        # An ampersand or a quoted "<" in a draft must not become markup.
        markup = "".join(f"<p>{html.escape(p.strip())}</p>"
                         for p in body.split("\n\n") if p.strip())
        out.append({"entry_id": reply["entry_id"],
                    "author": reply.get("author") or authors.get(reply["entry_id"], "?"),
                    "message": markup})
    return out


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--bundle", required=True)
    ap.add_argument("--drafts", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args(argv)

    bundle = json.loads(pathlib.Path(args.bundle).read_text())
    drafts = json.loads(pathlib.Path(args.drafts).read_text())
    topics = bundle.get("topics") or []
    if not topics:
        raise SystemExit("bundle has no topics")
    topic = topics[0]
    if len(topics) > 1:
        raise SystemExit("one topic per script - the console snippet is per discussion page")

    # Paste bundles number their entries 1..n as they are read. Those are not
    # Canvas entry ids, so posting against them would target whatever entries
    # happen to hold those ids in the live course.
    synthetic = (bundle.get("entry_ids") == "synthetic"
                 or (bundle.get("school_id") == "paste"
                     and bundle.get("entry_ids") != "canvas"))
    if synthetic or not topic.get("course_id") or not bundle.get("base_url"):
        raise SystemExit(
            "this bundle has no real Canvas entry ids, so its replies cannot be "
            "addressed to actual posts. Posting needs a bundle from "
            "browser/fetch_thread.js, browser/read_thread_min.js, or fetch_week.py "
            "-- hand-typed paste text has read-order counters, not Canvas ids."
        )

    messages = build_messages(bundle, drafts)
    if not messages:
        raise SystemExit("no drafts with content to post")

    path = pathlib.Path(args.out)
    path.parent.mkdir(parents=True, exist_ok=True)
    # The title lands in a // comment. A line terminator there would end the
    # comment and turn the rest of the line into code, in a console session
    # that holds the CSRF token.
    title = re.sub(r"[\r\n\u2028\u2029]+", " ", topic.get("topic_title", "")).strip()

    path.write_text(TEMPLATE % {
        "title": title,
        "course": json.dumps(topic.get("course_id")),
        "topic": json.dumps(topic.get("topic_id")),
        "origin": json.dumps(bundle.get("base_url", "")),
        "count": len(messages),
        "drafts": json.dumps(messages, indent=2),
    })
    print(f"{len(messages)} reply(ies) -> {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
