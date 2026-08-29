"""Self-contained checks for the paths that reach students.

No dependencies, no test runner:  python3 tests/test_pipeline.py
"""

import json
import pathlib
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from canvas_weekly import from_paste, make_poster, render_review          # noqa: E402
from canvas_weekly.canvas_client import CanvasClient, CanvasError         # noqa: E402

FAILURES = []


def check(name, condition, detail=""):
    print(f"  {'ok  ' if condition else 'FAIL'}  {name}")
    if not condition:
        FAILURES.append(f"{name}{': ' + detail if detail else ''}")


LIVE = """COURSE_ID: 51718
TOPIC_ID: 454157
TOPIC: Chapter 1 Discussion
URL: https://canvas.csuchico.edu/courses/51718/discussion_topics/454157
ME: Patricia Instructor [user:35997]
PROMPT: Sentencing.

--- Ana Student [entry:1969349]
First post.

  --- Pat Instructor [entry:1969400 user:35997]
  Canvas shows a short display name here; the ME: line does not match it.

--- Bo Student [entry:1971523]
Second post.
"""

HAND_TYPED = """TOPIC: Week 4
ME: Pat Instructor

--- Ana Student
First post.

--- Bo Student
Second post.
"""

HEADERS_ONLY = """COURSE_ID: 51718
TOPIC_ID: 454157
URL: https://canvas.csuchico.edu/courses/51718/discussion_topics/454157
ME: Patricia Instructor [user:35997]

--- Ana Student
Retyped by hand, so this entry id is a counter, not a Canvas id.
"""

ADVERSARIAL = """TOPIC: Week 4
ME: Pat Instructor

--- Ana Student
Two ideas.

---

My source:
URL: https://example.org
TOPIC: still my post
"""


def bundle_from(text):
    topics, warnings = from_paste.parse(text)
    return from_paste.to_bundle(topics, "Test"), warnings


def test_real_ids():
    print("\nreader output with Canvas ids")
    b, _ = bundle_from(LIVE)
    t = b["topics"][0]
    check("entry_ids marked canvas", b["entry_ids"] == "canvas", b["entry_ids"])
    check("base_url derived from URL header",
          b["base_url"] == "https://canvas.csuchico.edu", b["base_url"])
    check("course and topic ids real",
          (t["course_id"], t["topic_id"]) == (51718, 454157))
    check("author names carry no id suffix",
          all("[" not in e["author"] for e in t["thread"]))
    check("instructor matched by user id despite a different display name",
          all(e["author"] != "Pat Instructor" for e in t["needs_reply"]),
          str([e["author"] for e in t["needs_reply"]]))
    check("answered post excluded, unanswered kept",
          [e["entry_id"] for e in t["needs_reply"]] == [1971523],
          str([e["entry_id"] for e in t["needs_reply"]]))


def test_hand_typed_is_synthetic():
    print("\nhand-typed paste")
    b, _ = bundle_from(HAND_TYPED)
    check("entry_ids marked synthetic", b["entry_ids"] == "synthetic", b["entry_ids"])
    check("both students flagged", len(b["topics"][0]["needs_reply"]) == 2)


def test_adversarial_paste():
    print("\npost text that looks like syntax")
    b, warnings = bundle_from(ADVERSARIAL)
    check("one topic, not two", len(b["topics"]) == 1, str(len(b["topics"])))
    post = b["topics"][0]["thread"][0]
    check("bare --- divider stays in the post", "---" in post["message"])
    check("URL:/TOPIC: lines stay in the post", "TOPIC: still my post" in post["message"])
    check("misread lines are reported", len(warnings) >= 2, str(warnings))


def test_real_headers_synthetic_entries():
    """The dangerous middle case: real course, but entry ids typed by hand.

    Posting against these would address replies to whatever entries happen to
    hold ids 1..n in a live course.
    """
    print("\nreal headers, hand-typed posts")
    b, _ = bundle_from(HEADERS_ONLY)
    check("entry_ids marked synthetic", b["entry_ids"] == "synthetic", b["entry_ids"])
    with tempfile.TemporaryDirectory() as tmp:
        d = pathlib.Path(tmp)
        (d / "b.json").write_text(json.dumps(b))
        (d / "drafts.json").write_text(json.dumps({"replies": [
            {"topic_id": 454157, "entry_id": 1, "author": "Ana Student",
             "draft": "Body."}], "topic_additions": []}))
        refused = False
        try:
            make_poster.main(["--bundle", str(d / "b.json"),
                              "--drafts", str(d / "drafts.json"),
                              "--out", str(d / "out.js")])
        except SystemExit:
            refused = True
        check("poster refuses despite a real course and origin",
              refused and not (d / "out.js").exists())


def test_poster_guard():
    print("\nposter guard")
    drafts = {"replies": [{"topic_id": 454157, "entry_id": 1971523,
                           "author": "Bo Student", "draft": "Body."}],
              "topic_additions": []}
    with tempfile.TemporaryDirectory() as tmp:
        d = pathlib.Path(tmp)
        (d / "drafts.json").write_text(json.dumps(drafts))

        real, _ = bundle_from(LIVE)
        (d / "real.json").write_text(json.dumps(real))
        rc = make_poster.main(["--bundle", str(d / "real.json"),
                               "--drafts", str(d / "drafts.json"),
                               "--out", str(d / "real.js")])
        check("accepts a bundle with Canvas ids", rc == 0 and (d / "real.js").exists())
        js = (d / "real.js").read_text()
        check("targets the real entry id", '"entry_id": 1971523' in js)
        check("targets the real course", "COURSE = 51718" in js)

        synth, _ = bundle_from(HAND_TYPED)
        (d / "synth.json").write_text(json.dumps(synth))
        refused = False
        try:
            make_poster.main(["--bundle", str(d / "synth.json"),
                              "--drafts", str(d / "drafts.json"),
                              "--out", str(d / "synth.js")])
        except SystemExit:
            refused = True
        check("refuses hand-typed ids", refused and not (d / "synth.js").exists())


def test_guard_truth_table():
    """Pin each clause of the poster guard independently.

    The guard refuses on `entry_ids == "synthetic"` and, separately, on a paste
    bundle that predates the entry_ids field. Either alone must refuse, so
    neither can be dropped without a test noticing.
    """
    print("\nposter guard, clause by clause")
    base = {"base_url": "https://canvas.csuchico.edu",
            "topics": [{"course_id": 51718, "topic_id": 454157, "topic_title": "T",
                        "course_name": "C", "topic_url": "",
                        "needs_reply": [{"entry_id": 1, "author": "A"}]}]}
    cases = [
        ({"school_id": "paste", "entry_ids": "synthetic"}, True, "paste + synthetic"),
        ({"school_id": "browser", "entry_ids": "synthetic"}, True, "entry_ids clause alone"),
        ({"school_id": "paste"}, True, "school_id clause alone (pre-entry_ids bundle)"),
        ({"school_id": "paste", "entry_ids": "canvas"}, False, "paste + canvas is postable"),
    ]
    with tempfile.TemporaryDirectory() as tmp:
        d = pathlib.Path(tmp)
        (d / "drafts.json").write_text(json.dumps({"replies": [
            {"topic_id": 454157, "entry_id": 1, "author": "A", "draft": "x"}],
            "topic_additions": []}))
        for extra, want_refused, label in cases:
            (d / "b.json").write_text(json.dumps({**base, **extra}))
            out = d / "b.js"
            if out.exists():
                out.unlink()
            refused = False
            try:
                make_poster.main(["--bundle", str(d / "b.json"),
                                  "--drafts", str(d / "drafts.json"), "--out", str(out)])
            except SystemExit:
                refused = True
            check(f"{label}: {'refused' if want_refused else 'accepted'}",
                  refused == want_refused and out.exists() == (not want_refused))


def test_outbound_escaping():
    print("\nescaping on the way out to students")
    bundle = {"topics": [{"needs_reply": [{"entry_id": 1, "author": "Ana"}]}]}
    drafts = {"replies": [{"entry_id": 1, "author": "Ana",
                           "draft": 'Costs fell to <0.5c, and Rockefeller & Co merged.',
                           "probing_question": "Is price < cost predation?"}]}
    msg = make_poster.build_messages(bundle, drafts)[0]["message"]
    check("< escaped", "&lt;0.5c" in msg, msg[:80])
    check("& escaped", "Rockefeller &amp; Co" in msg)
    check("wrapped in paragraphs", msg.startswith("<p>") and msg.endswith("</p>"))
    check("no raw angle brackets left",
          "<" not in msg.replace("<p>", "").replace("</p>", ""))


def test_review_page_escaping():
    print("\nescaping on the way in to the review page")
    bundle = {"school_name": "X", "base_url": "https://h", "generated_at": "2026-01-01",
              "topics": [{"topic_id": 1, "course_id": 9, "course_name": "C",
                          "topic_title": "T", "topic_url": "", "topic_prompt": "",
                          "entry_count": 1, "thread": [],
                          "needs_reply": [{"entry_id": 7, "author": "Ana",
                                           "created_at": "2026-01-01",
                                           "message": "<script>alert(1)</script>"}]}]}
    drafts = {"replies": [{"topic_id": 1, "entry_id": 7, "author": "Ana",
                           "draft": "<img onerror=x>"}], "topic_additions": []}
    html = render_review.render(bundle, drafts)
    check("student script tag neutralized", "<script>alert(1)</script>" not in html)
    check("draft img tag neutralized", "<img onerror" not in html)
    check("page declares a charset", 'charset="utf-8"' in html)


def test_client_is_read_only():
    print("\nCanvas client")
    c = CanvasClient("https://example.test", "token")
    check("no write verbs exposed",
          not any(hasattr(c, v) for v in ("post", "post_entry", "reply_to_entry")))
    refused = False
    try:
        c._request("POST", "https://example.test/api/v1/x")
    except CanvasError:
        refused = True
    check("non-GET refused", refused)


def test_reader_omits_student_ids():
    print("\nbrowser reader")
    js = (ROOT / "browser" / "read_thread_min.js").read_text()
    check("tags the instructor's user id only", "e.user_id === me.id ?" in js)
    check("parses HTML inertly", "innerHTML" not in js and "DOMParser" in js)
    fetch_js = (ROOT / "browser" / "fetch_thread.js").read_text()
    check("fetch_thread.js also inert",
          "innerHTML" not in fetch_js.split("//")[0] + fetch_js.replace(
              "// innerHTML on a detached div would still fire <img onerror> from a student's", ""))


def main():
    for fn in (test_real_ids, test_hand_typed_is_synthetic,
               test_real_headers_synthetic_entries, test_adversarial_paste,
               test_poster_guard, test_guard_truth_table, test_outbound_escaping, test_review_page_escaping,
               test_client_is_read_only, test_reader_omits_student_ids):
        fn()
    print()
    if FAILURES:
        print(f"{len(FAILURES)} check(s) failed:")
        for f in FAILURES:
            print(f"  - {f}")
        return 1
    print("all checks passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
