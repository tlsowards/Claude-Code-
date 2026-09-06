// Paste into the browser console on any Canvas page inside a course.
// Lists that course's discussion topics so you can pick which to work on.
// Read-only: GETs only.

(async () => {
  const m = location.pathname.match(/courses\/(\d+)/);
  if (!m) return console.error('Open a page inside the course first.');
  const course = m[1];

  // One request helper: returns the parsed body and the next page, if any.
  const req = async p => {
    const r = await fetch(p, { credentials: 'same-origin', headers: { Accept: 'application/json' } });
    if (!r.ok) throw new Error(`${p} -> HTTP ${r.status}`);
    const body = JSON.parse((await r.text()).replace(/^while\(1\);/, ''));
    const next = (r.headers.get('Link') || '').match(/<([^>]+)>\s*;\s*rel="next"/);
    return { body, next: next ? next[1] : null };
  };
  const get = async p => (await req(p)).body;

  const [me, info] = await Promise.all([get('/api/v1/users/self'), get(`/api/v1/courses/${course}`)]);

  // Paginate: a term's worth of topics runs past one page.
  let url = `/api/v1/courses/${course}/discussion_topics?per_page=100&exclude_assignment_descriptions=true`;
  const topics = [];
  while (url) {
    const page = await req(url);
    topics.push(...page.body);
    url = page.next;
  }

  const live = topics.filter(t => !t.locked_for_user);
  live.sort((a, b) => new Date(b.last_reply_at || b.posted_at || 0) - new Date(a.last_reply_at || a.posted_at || 0));

  const lines = [`COURSE: ${info.name}`, `COURSE_ID: ${course}`, `SITE: ${location.origin}`,
                 `ME: ${me.name} [user:${me.id}]`, ''];
  for (const t of live) {
    const last = t.last_reply_at ? String(t.last_reply_at).slice(0, 10) : 'no replies';
    lines.push(`${t.id}  ${t.discussion_subentry_count ?? 0} replies  last ${last}  ${t.title}`);
    lines.push(`      ${location.origin}/courses/${course}/discussion_topics/${t.id}`);
  }

  const out = lines.join('\n');
  try { await navigator.clipboard.writeText(out); } catch (_) {}
  console.log(out);
  console.log(`\n--- ${live.length} topic(s); copied to clipboard. Paste to Claude, or run`);
  console.log('--- read_thread_min.js on the topic page you want worked. ---');
})();
