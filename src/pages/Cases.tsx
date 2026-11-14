import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { teachingBriefs, formatDate } from '../data/content';
import { statusLabel } from '../components/CaseCard';

export default function Cases() {
  const [q, setQ] = useState('');
  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return teachingBriefs;
    return teachingBriefs.filter((t) => [t.name, t.topic, t.summary, t.facts, t.holding, t.trainIt].join(' ').toLowerCase().includes(term));
  }, [q]);

  return (
    <>
      <Seo title="Case library" description="Standalone teaching briefs on the use of force decisions that come up in training again and again, each ending with what it means in practice and how to train it." />
      <div className="eyebrow">Case library</div>
      <h1>The decisions that keep coming up</h1>
      <p className="lead">
        One decision per brief, not tied to a week. The same structure as the weekly brief: facts, holding, what it means in practice, and how to train it. Each one is verified against the opinion before it is added.
      </p>
      <label className="sr-only" htmlFor="case-search">Search the case library</label>
      <input id="case-search" className="search" type="search" placeholder="Search cases, topics, or training points" value={q} onChange={(e) => setQ(e.target.value)} />
      {teachingBriefs.length === 0 && (
        <div className="card">
          <p style={{ margin: 0 }}>Teaching briefs are added here as they are verified. The <Link to="/briefs">weekly briefs</Link> carry the newest decisions.</p>
        </div>
      )}
      {teachingBriefs.length > 0 && results.length === 0 && <p className="meta">No cases match that search.</p>}
      {results.map((t) => (
        <Link key={t.id} to={`/cases/${t.id}`} className="card card-link">
          <h2>{t.name}</h2>
          <div className="meta">
            {t.court} · {t.decided} · {statusLabel[t.status]} · Added {formatDate(t.published)}
          </div>
          <p style={{ marginTop: 8, marginBottom: 0 }}>{t.summary}</p>
        </Link>
      ))}
    </>
  );
}
