// Paste into the console on a GRADED discussion topic page.
//
// Same as read_thread_min.js, but tags every post with the real Canvas user id
// and captures the assignment id, because grades are addressed to a student on
// an assignment. Use the plain reader when you are only drafting replies --
// this output carries student ids, so keep it to your own machine and this
// conversation.
//
// Read-only: GETs only. Nothing here writes a grade.

(async () => {
  const m = location.pathname.match(/courses\/(\d+)\/discussion_topics\/(\d+)/);
  if (!m) return console.error('Open the discussion topic page first.');
  const [, c, t] = m;

  const g = async p => {
    const r = await fetch(p, { credentials: 'same-origin', headers: { Accept: 'application/json' } });
    if (!r.ok) throw new Error(`${p} -> HTTP ${r.status}`);
    return JSON.parse((await r.text()).replace(/^while\(1\);/, ''));
  };

  const base = `/api/v1/courses/${c}/discussion_topics/${t}`;
  const [me, top, v] = await Promise.all([g('/api/v1/users/self'), g(base), g(`${base}/view`)]);

  if (!top.assignment_id) {
    console.warn('This topic is not a graded assignment -- grades cannot be posted to it.');
  }

  const n = {};
  (v.participants || []).forEach(p => n[p.id] = p.display_name || p.name || p.id);

  const txt = h => {
    const d = new DOMParser().parseFromString((h || '').replace(/<br\s*\/?>|<\/p>/gi, '\n'), 'text/html');
    return (d.body.textContent || '').replace(/\n{3,}/g, '\n\n').trim();
  };

  const out = [`COURSE_ID: ${c}`, `TOPIC_ID: ${t}`,
               `ASSIGNMENT_ID: ${top.assignment_id || ''}`,
               `TOPIC: ${top.title}`,
               `URL: ${location.origin}/courses/${c}/discussion_topics/${t}`,
               `ME: ${me.name} [user:${me.id}]`, `PROMPT: ${txt(top.message)}`, ''];

  const walk = (list, depth) => (list || []).forEach(e => {
    if (e.deleted) { walk(e.replies, depth); return; }
    out.push('  '.repeat(depth) +
             `--- ${n[e.user_id] || '?'} [entry:${e.id} user:${e.user_id} at:${e.created_at || ''}]`,
             '  '.repeat(depth) + txt(e.message), '');
    walk(e.replies, depth + 1);
  });
  walk(v.view, 0);

  const s = out.join('\n');
  try { await navigator.clipboard.writeText(s); } catch (_) {}
  console.log(s);
  console.log(`--- assignment ${top.assignment_id || '(none)'}; copied to clipboard. Paste to Claude. ---`);
})();
