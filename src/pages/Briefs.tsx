import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { briefs, formatRange } from '../data/content';

export default function Briefs() {
  const [q, setQ] = useState('');
  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return briefs;
    return briefs.filter((b) => {
      const hay = [b.title, b.summary, ...b.sections.flatMap((s) => s.cases.flatMap((c) => [c.name, c.topic, c.facts, c.holding, c.trainIt]))]
        .join(' ')
        .toLowerCase();
      return hay.includes(term);
    });
  }, [q]);

  return (
    <>
      <Seo title="Weekly use of force briefs" description="Weekly use of force case law briefs for officers, supervisors, and trainers, with practice and training points for every case." />
      <div className="eyebrow">Weekly briefs</div>
      <h1>Use of force case law, written for training</h1>
      <p className="lead">
        One brief a week. Federal first, then California, then application. Each case ends with what it means in practice and how to train it.
      </p>
      <img className="page-banner" src={`${import.meta.env.BASE_URL}images/banner-use-of-force.jpg`} alt="Defensible use of force: law, action, justification" width="1280" height="720" />
      <label className="sr-only" htmlFor="brief-search">Search briefs</label>
      <input id="brief-search" className="search" type="search" placeholder="Search cases, topics, or training points" value={q} onChange={(e) => setQ(e.target.value)} />
      {results.length === 0 && <p className="meta">No briefs match that search.</p>}
      {results.map((b) => {
        const count = b.sections.reduce((n, s) => n + s.cases.length, 0);
        return (
          <Link key={b.id} to={`/briefs/${b.id}`} className="card card-link">
            <h2>{b.title}</h2>
            <div className="meta">
              Decisions from {formatRange(b.coverageStart, b.coverageEnd)} · {count} {count === 1 ? 'case' : 'cases'}
            </div>
            <p style={{ marginTop: 8, marginBottom: 0 }}>{b.summary}</p>
          </Link>
        );
      })}
    </>
  );
}
