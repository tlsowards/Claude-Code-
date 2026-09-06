// Clears zeros Canvas auto-applied to missing submissions, for ONE assignment.
//
// Open the assignment (or its SpeedGrader) so the URL carries the course and
// assignment id, then paste this into the console.
//
// DRY_RUN is true: it lists what it would clear and writes nothing. Read that
// list before setting it to false.
//
// It only touches a submission where ALL of these hold:
//   - Canvas flags it missing
//   - nothing was ever submitted (submitted_at is null)
//   - the score is exactly 0
// A zero you actually gave a student has a submission behind it, so it is left
// alone. Read the dry run anyway -- this is your gradebook.

(async () => {
  const DRY_RUN = true;

  const m = location.pathname.match(/courses\/(\d+)\/(?:assignments|gradebook\/speed_grader)/);
  const course = m && m[1];
  const assignment = (location.pathname.match(/assignments\/(\d+)/) || [])[1]
    || new URLSearchParams(location.search).get('assignment_id');
  if (!course || !assignment) {
    return console.error('Open the assignment page (or SpeedGrader) for the assignment you want cleared.');
  }

  const csrf = decodeURIComponent(
    (document.cookie.match(/(?:^|;\s*)_csrf_token=([^;]+)/) || [])[1] || '');
  if (!csrf) return console.error('No CSRF token - are you logged in on this page?');

  const req = async p => {
    const r = await fetch(p, { credentials: 'same-origin', headers: { Accept: 'application/json' } });
    if (!r.ok) throw new Error(`${p} -> HTTP ${r.status}`);
    const body = JSON.parse((await r.text()).replace(/^while\(1\);/, ''));
    const next = (r.headers.get('Link') || '').match(/<([^>]+)>\s*;\s*rel="next"/);
    return { body, next: next ? next[1] : null };
  };

  let url = `/api/v1/courses/${course}/assignments/${assignment}/submissions?per_page=100&include[]=user`;
  const subs = [];
  while (url) { const page = await req(url); subs.push(...page.body); url = page.next; }

  const auto = subs.filter(s => s.missing === true && !s.submitted_at && s.score === 0);
  const realZeros = subs.filter(s => s.score === 0 && s.submitted_at);

  console.log(`${subs.length} submission(s); ${auto.length} look like auto-applied zeros.`);
  if (realZeros.length) {
    console.log(`${realZeros.length} zero(s) have a real submission behind them and will NOT be touched:`);
    realZeros.forEach(s => console.log(`   keep   ${s.user?.name || s.user_id}`));
  }
  if (!auto.length) return console.log('Nothing to clear.');

  let cleared = 0, failed = 0;
  for (const s of auto) {
    const who = s.user?.name || s.user_id;
    if (DRY_RUN) { console.log(`would clear  ${who}  (0 -> blank)`); continue; }
    try {
      const res = await fetch(
        `/api/v1/courses/${course}/assignments/${assignment}/submissions/${s.user_id}`, {
          method: 'PUT', credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
          body: JSON.stringify({ submission: { posted_grade: '' } }),
        });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      console.log(`cleared ${who}`);
      cleared++;
    } catch (err) { console.error(`FAILED ${who}: ${err.message}`); failed++; }
    await new Promise(r => setTimeout(r, 400));
  }
  console.log(DRY_RUN ? '\ndry run - nothing changed. Set DRY_RUN = false to clear.'
                      : `\ndone - ${cleared} cleared, ${failed} failed.`);
})();
