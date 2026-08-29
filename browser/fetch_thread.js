// Paste into the browser console while viewing a Canvas discussion topic.
//
// Reads the thread through Canvas's own API using your existing login, builds
// the bundle the drafting tools expect, and copies it to your clipboard.
// Read-only: it issues GETs and nothing else.
//
// Chrome blocks console pasting until you type "allow pasting" once per session.

(async () => {
  const match = location.pathname.match(/courses\/(\d+)\/discussion_topics\/(\d+)/);
  if (!match) return console.error('Open a discussion topic page first.');
  const [, courseId, topicId] = match;

  // Canvas guards some JSON responses with a leading while(1); to defeat XSSI.
  const api = async (path) => {
    const res = await fetch(path, { credentials: 'same-origin',
                                    headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`${path} -> HTTP ${res.status}`);
    return JSON.parse((await res.text()).replace(/^while\(1\);/, ''));
  };

  const base = `/api/v1/courses/${courseId}/discussion_topics/${topicId}`;
  const [me, topic, view, course] = await Promise.all([
    api('/api/v1/users/self'), api(base), api(`${base}/view`),
    api(`/api/v1/courses/${courseId}`),
  ]);

  const names = {};
  for (const p of view.participants || []) names[p.id] = p.display_name || p.name || `user ${p.id}`;

  // DOMParser builds an inert document: no resource loads, no event handlers.
  // innerHTML on a detached div would still fire <img onerror> from a student's
  // post, and this runs inside your authenticated Canvas session.
  const text = (raw) => {
    const doc = new DOMParser().parseFromString(
      (raw || '').replace(/<br\s*\/?>|<\/p>/gi, '\n'), 'text/html');
    return (doc.body.textContent || '').replace(/\n{3,}/g, '\n\n').trim();
  };

  const thread = [];
  const walk = (entries, parent, depth) => {
    for (const e of entries || []) {
      if (e.deleted) continue;
      thread.push({
        entry_id: e.id, author: names[e.user_id] || 'unknown', author_id: e.user_id,
        created_at: e.created_at, depth, replying_to: parent,
        message: text(e.message),
      });
      walk(e.replies, names[e.user_id] || 'unknown', depth + 1);
    }
  };
  walk(view.view, null, 0);

  // A post is handled if anyone below it in its own subtree is you.
  const answered = (entry, i) => {
    for (let j = i + 1; j < thread.length && thread[j].depth > entry.depth; j++)
      if (thread[j].author_id === me.id) return true;
    return false;
  };
  const needs = thread.filter((e, i) => e.author_id !== me.id && !answered(e, i));

  const bundle = {
    school_id: 'browser', school_name: course.name || 'Canvas',
    base_url: location.origin, source: 'browser console (session auth, no token)',
    instructor: { id: me.id, name: me.name },
    generated_at: new Date().toISOString(),
    topics: [{
      course_id: Number(courseId), course_name: course.name || '',
      topic_id: Number(topicId), topic_title: topic.title || '',
      topic_url: `${location.origin}${base.replace('/api/v1', '')}`,
      topic_prompt: text(topic.message), posted_at: topic.posted_at,
      entry_count: thread.length, needs_reply: needs, thread,
    }],
  };

  const json = JSON.stringify(bundle, null, 2);
  try { await navigator.clipboard.writeText(json); } catch (_) {}
  console.log(`${thread.length} post(s) in thread, ${needs.length} awaiting a reply.`);
  console.log('Bundle copied to clipboard. Paste it to Claude.');
  console.log(bundle);
})();
