"""Generate the browser script that enters grades in Canvas.

Takes the sidecar grade_week writes and emits a console snippet the instructor
pastes on the assignment's SpeedGrader or course page. It writes through
Canvas's API on their own session, like the reply poster.

    python3 -m canvas_weekly.make_grade_poster --grades grades/x.json --out post_grades.js
"""

from __future__ import annotations

import argparse
import json
import pathlib

TEMPLATE = """// Grades for assignment %(assignment)s in course %(course)s on %(origin)s
//
// Paste into the browser console on that course. Enters %(count)d grade(s) as
// you. Chrome blocks console pasting until you type "allow pasting" once.
//
// DRY_RUN is true: it reports what it would change and writes nothing. Read the
// output, then set it to false and paste again to enter the grades for real.
//
// Re-running is safe: a student whose current grade already matches is skipped,
// so nothing is overwritten with the same value twice.

(async () => {
  const DRY_RUN = true;

  const GRADES = %(grades)s;
  const COURSE = %(course)s, ASSIGNMENT = %(assignment)s, TOTAL = %(total)s;
  const expected = %(origin)s;

  if (location.origin !== expected) return console.error(`Wrong site. Open ${expected}`);
  if (!ASSIGNMENT) return console.error('No assignment id: this discussion is not graded.');

  const csrf = decodeURIComponent(
    (document.cookie.match(/(?:^|;\\s*)_csrf_token=([^;]+)/) || [])[1] || '');
  if (!csrf) return console.error('No CSRF token found - are you logged in on this page?');

  const base = `/api/v1/courses/${COURSE}/assignments/${ASSIGNMENT}/submissions`;
  const get = async p => {
    const r = await fetch(p, { credentials: 'same-origin', headers: { Accept: 'application/json' } });
    if (!r.ok) throw new Error(`${p} -> HTTP ${r.status}`);
    return JSON.parse((await r.text()).replace(/^while\\(1\\);/, ''));
  };

  let wrote = 0, same = 0, failed = 0;
  for (const g of GRADES) {
    let current = null;
    try {
      current = await get(`${base}/${g.user_id}`);
    } catch (err) {
      console.error(`SKIP   ${g.student}: cannot read submission (${err.message})`);
      failed++;
      continue;
    }

    const now = current.score;
    if (now !== null && Math.abs(now - g.score) < 0.01) {
      console.log(`same   ${g.student}: already ${now}`);
      same++;
      continue;
    }

    if (DRY_RUN) {
      console.log(`would  ${g.student}: ${now === null ? 'ungraded' : now} -> ${g.score} / ${TOTAL}`
                  + (g.notes ? `   (${g.notes})` : ''));
      continue;
    }

    try {
      const res = await fetch(`${base}/${g.user_id}`, {
        method: 'PUT', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
        body: JSON.stringify({ submission: { posted_grade: String(g.score) } }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
      console.log(`graded ${g.student}: ${g.score} / ${TOTAL}`);
      wrote++;
    } catch (err) {
      console.error(`FAILED ${g.student}: ${err.message}`);
      failed++;
    }
    await new Promise(r => setTimeout(r, 400));
  }

  console.log(DRY_RUN
    ? `\\ndry run - nothing written. ${same} already correct, ${failed} unreadable.`
    : `\\ndone - ${wrote} graded, ${same} already correct, ${failed} failed.`);
})();
"""


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--grades", required=True, help="the .json grade_week wrote")
    ap.add_argument("--out", required=True)
    args = ap.parse_args(argv)

    data = json.loads(pathlib.Path(args.grades).read_text())
    if not data.get("assignment_id"):
        raise SystemExit(
            "no assignment id in this file, so grades have nowhere to go. The "
            "discussion must be a graded assignment, and the thread must be read "
            "with browser/read_for_grading.js, which captures it."
        )
    if not data.get("grades"):
        raise SystemExit("no grades with Canvas user ids in this file")

    path = pathlib.Path(args.out)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(TEMPLATE % {
        "course": json.dumps(data.get("course_id")),
        "assignment": json.dumps(data.get("assignment_id")),
        "origin": json.dumps(data.get("base_url", "")),
        "total": json.dumps(data.get("total_points")),
        "count": len(data["grades"]),
        "grades": json.dumps(data["grades"], indent=2),
    })
    print(f"{len(data['grades'])} grade(s) -> {path}  (DRY_RUN is on by default)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
