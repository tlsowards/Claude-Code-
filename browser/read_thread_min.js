(async () => {
  const m = location.pathname.match(/courses\/(\d+)\/discussion_topics\/(\d+)/);
  if (!m) return console.error('Open the discussion topic page first.');
  const g = async p => JSON.parse((await (await fetch(p, {credentials:'same-origin'})).text()).replace(/^while\(1\);/, ''));
  const [, c, t] = m;
  const [me, top, v] = await Promise.all([g('/api/v1/users/self'), g(`/api/v1/courses/${c}/discussion_topics/${t}`), g(`/api/v1/courses/${c}/discussion_topics/${t}/view`)]);
  const n = {}; (v.participants || []).forEach(p => n[p.id] = p.display_name || p.name || p.id);
  const txt = h => { const d = new DOMParser().parseFromString((h||'').replace(/<br\s*\/?>|<\/p>/gi,'\n'), 'text/html'); return (d.body.textContent||'').trim(); };
  const out = [`COURSE: ${c}`, `TOPIC: ${top.title}`, `TOPIC_ID: ${t}`, `ME: ${me.name} [id:${me.id}]`, `PROMPT: ${txt(top.message)}`, ''];
  const walk = (l, d) => (l||[]).forEach(e => { if (e.deleted) return;
    out.push('  '.repeat(d) + `--- ${n[e.user_id]||'?'} [entry:${e.id}]`, '  '.repeat(d) + txt(e.message), '');
    walk(e.replies, d + 1); });
  walk(v.view, 0);
  const s = out.join('\n');
  try { await navigator.clipboard.writeText(s); } catch(_) {}
  console.log(s);
  console.log('--- copied to clipboard; paste this to Claude ---');
})();
