"""Render a bundle + Claude's drafts into a single review page.

The instructor reads this page, edits what they want, and posts. Nothing
here writes to Canvas.

    python3 -m canvas_weekly.render_review --bundle b.json --drafts d.json --out review.html
"""

from __future__ import annotations

import argparse
import html
import json
import pathlib

CSS = """
:root{--bg:#f7f6f3;--card:#fff;--ink:#1c1b19;--muted:#6b675f;--line:#e2ded6;
--accent:#7a4f2b;--accent-soft:#f2e9e0;--student:#f4f2ee}
:root:not([data-theme="light"]){}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
--bg:#171614;--card:#201f1c;--ink:#eceae5;--muted:#a09a8f;--line:#332f2a;
--accent:#d9a878;--accent-soft:#2a2320;--student:#1b1a17}}
:root[data-theme="dark"]{--bg:#171614;--card:#201f1c;--ink:#eceae5;--muted:#a09a8f;
--line:#332f2a;--accent:#d9a878;--accent-soft:#2a2320;--student:#1b1a17}
*{box-sizing:border-box}
body{background:var(--bg);color:var(--ink);font:16px/1.6 ui-serif,Georgia,serif;
margin:0;padding:2.5rem 1.25rem 5rem}
.wrap{max-width:52rem;margin:0 auto}
h1{font-size:1.7rem;margin:0 0 .3rem;letter-spacing:-.01em}
.sub{color:var(--muted);font:14px/1.5 ui-sans-serif,system-ui,sans-serif;margin:0 0 2.5rem}
.topic{margin:0 0 3rem}
.topic>h2{font-size:1.2rem;margin:0 0 .2rem}
.crumb{font:12px/1.4 ui-sans-serif,system-ui,sans-serif;text-transform:uppercase;
letter-spacing:.07em;color:var(--muted);margin:0 0 .4rem}
a{color:var(--accent)}
.card{background:var(--card);border:1px solid var(--line);border-radius:10px;
padding:1.1rem 1.25rem;margin:1rem 0}
.student{background:var(--student)}
.who{font:600 13px/1.4 ui-sans-serif,system-ui,sans-serif;margin:0 0 .5rem}
.who span{font-weight:400;color:var(--muted)}
.msg{white-space:pre-wrap;margin:0}
.label{font:600 11px/1.4 ui-sans-serif,system-ui,sans-serif;text-transform:uppercase;
letter-spacing:.09em;color:var(--accent);margin:0 0 .5rem}
.draft{border-left:3px solid var(--accent)}
.probe{background:var(--accent-soft);border-radius:8px;padding:.7rem .9rem;margin:.9rem 0 0}
.probe p{margin:0}
.note{font:13px/1.5 ui-sans-serif,system-ui,sans-serif;color:var(--muted);
margin:.8rem 0 0;font-style:italic}
button{font:500 13px ui-sans-serif,system-ui,sans-serif;background:none;color:var(--accent);
border:1px solid var(--line);border-radius:6px;padding:.3rem .7rem;cursor:pointer;margin-top:.9rem}
button:hover{background:var(--accent-soft)}
.empty{color:var(--muted);font-style:italic}
footer{border-top:1px solid var(--line);margin-top:3rem;padding-top:1rem;
font:13px/1.6 ui-sans-serif,system-ui,sans-serif;color:var(--muted)}
"""

JS = """
document.addEventListener('click', e => {
  const b = e.target.closest('button[data-copy]'); if(!b) return;
  const src = document.getElementById(b.dataset.copy);
  navigator.clipboard.writeText(src.innerText).then(() => {
    const was = b.textContent; b.textContent = 'Copied'; 
    setTimeout(() => { b.textContent = was; }, 1400);
  });
});
"""


def esc(text) -> str:
    return html.escape(str(text or ""))


def render(bundle: dict, drafts: dict) -> str:
    topics = {t["topic_id"]: t for t in bundle.get("topics", [])}
    entries = {e["entry_id"]: (t, e)
               for t in bundle.get("topics", []) for e in t["needs_reply"]}

    by_topic: dict[int, list] = {}
    for reply in drafts.get("replies", []):
        by_topic.setdefault(reply.get("topic_id"), []).append(reply)
    additions = {a["topic_id"]: a for a in drafts.get("topic_additions", [])}

    out = [f"<title>Weekly Discussion Drafts</title><style>{CSS}</style>",
           '<div class="wrap">',
           f"<h1>{esc(bundle.get('school_name'))} — discussion drafts</h1>",
           f'<p class="sub">Week ending {esc(bundle.get("generated_at", "")[:10])} · '
           f'{len(entries)} student post(s) awaiting reply · '
           f'drafted for your review — nothing has been posted to Canvas.</p>']

    if not topics:
        out.append('<p class="empty">No discussion activity in this window.</p>')

    for tid, topic in topics.items():
        base = bundle.get("base_url", "").rstrip("/")
        url = topic.get("topic_url") or f"{base}/courses/{topic['course_id']}/discussion_topics/{tid}"
        out.append('<section class="topic">')
        out.append(f'<p class="crumb">{esc(topic.get("course_name"))}</p>')
        out.append(f'<h2><a href="{esc(url)}">{esc(topic.get("topic_title"))}</a></h2>')

        add = additions.get(tid)
        if add:
            out.append('<div class="card draft">')
            out.append('<p class="label">Content to add to the thread</p>')
            out.append(f'<div class="msg" id="add-{tid}">{esc(add.get("content"))}</div>')
            for q in add.get("probing_questions", []):
                out.append(f'<div class="probe"><p>{esc(q)}</p></div>')
            out.append(f'<button data-copy="add-{tid}">Copy</button></div>')

        for reply in by_topic.get(tid, []):
            pair = entries.get(reply.get("entry_id"))
            student = pair[1] if pair else {}
            out.append('<div class="card student">')
            out.append(f'<p class="who">{esc(reply.get("author") or student.get("author"))} '
                       f'<span>· {esc(str(student.get("created_at", ""))[:10])}</span></p>')
            out.append(f'<p class="msg">{esc(student.get("message"))}</p></div>')

            eid = reply.get("entry_id")
            out.append('<div class="card draft">')
            out.append('<p class="label">Draft reply</p>')
            out.append(f'<div class="msg" id="r-{eid}">{esc(reply.get("draft"))}</div>')
            if reply.get("probing_question"):
                out.append(f'<div class="probe"><p>{esc(reply["probing_question"])}</p></div>')
            if reply.get("note"):
                out.append(f'<p class="note">{esc(reply["note"])}</p>')
            out.append(f'<button data-copy="r-{eid}">Copy</button></div>')

        out.append("</section>")

    out.append("<footer>Drafted by Claude from Canvas discussion data. Review, edit, "
               "and post under your own account — these are not posted automatically."
               "</footer></div>")
    out.append(f"<script>{JS}</script>")
    return "\n".join(out)


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--bundle", required=True)
    ap.add_argument("--drafts", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args(argv)

    bundle = json.loads(pathlib.Path(args.bundle).read_text())
    drafts = json.loads(pathlib.Path(args.drafts).read_text())
    path = pathlib.Path(args.out)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(render(bundle, drafts))
    print(f"review page -> {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
