import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Seo from '../components/Seo';
import { teachingBriefs, formatDate, leadAndRest } from '../data/content';
import { caseCategories, categoryLabel } from '../data/caseCategories';
import { statusLabel } from '../components/CaseCard';
import type { CaseCategory, TeachingBrief } from '../data/types';

function CaseRow({ t }: { t: TeachingBrief }) {
  return (
    <Link to={`/cases/${t.id}`} className="card card-link">
      <h2>{t.name}</h2>
      <div className="meta">
        {t.citation ? `${t.citation} · ` : ''}{t.court} · {t.decided} · {statusLabel[t.status]} · Added {formatDate(t.published)}
      </div>
      <p style={{ marginTop: 8, marginBottom: 0 }}>{leadAndRest(t.summary).lead}</p>
      {t.categories && t.categories.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {t.categories.map((c) => <span key={c} className="pill muted">{categoryLabel[c]}</span>)}
        </div>
      )}
    </Link>
  );
}

export default function Cases() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const cat = params.get('cat') as CaseCategory | null;
  const term = q.trim().toLowerCase();

  const counts = useMemo(() => {
    const m = new Map<CaseCategory, number>();
    for (const t of teachingBriefs) for (const c of t.categories ?? []) m.set(c, (m.get(c) ?? 0) + 1);
    return m;
  }, []);

  const results = useMemo(() => {
    let list = teachingBriefs;
    if (cat) list = list.filter((t) => t.categories?.includes(cat));
    if (term) list = list.filter((t) => [t.name, t.citation ?? '', t.court, t.topic, t.summary, t.facts, t.holding, t.trainIt, ...(t.categories ?? []).map((c) => categoryLabel[c])].join(' ').toLowerCase().includes(term));
    return list;
  }, [cat, term]);

  const grouped = !cat && !term;
  const setCat = (c: CaseCategory | null) => {
    const next = new URLSearchParams(params);
    if (c) next.set('cat', c); else next.delete('cat');
    setParams(next, { replace: true });
  };

  return (
    <>
      <Seo title="Case library" description="Teaching briefs on the use of force decisions that come up in training again and again, organized by topic: force standards, impact weapons, handcuffing, restraint, mental health, custody, qualified immunity, and instructor liability." />
      <div className="eyebrow">Case library</div>
      <h1>The decisions that keep coming up</h1>
      <p className="lead">
        One decision per brief, not tied to a week: facts, holding, what it means in practice, and how to train it. Each one is verified against the opinion before it is added. Browse by topic or search by case name, citation, or training point.
      </p>
      <label className="sr-only" htmlFor="case-search">Search the case library</label>
      <input id="case-search" className="search" type="search" placeholder="Search cases, citations, topics, or training points" value={q} onChange={(e) => setQ(e.target.value)} />
      <nav className="toc" aria-label="Topics">
        <a href="#all" onClick={(e) => { e.preventDefault(); setCat(null); }} aria-current={!cat ? 'page' : undefined} style={!cat ? { borderColor: 'var(--gold)', fontWeight: 600 } : undefined}>All ({teachingBriefs.length})</a>
        {caseCategories.filter((c) => (counts.get(c.id) ?? 0) > 0).map((c) => (
          <a key={c.id} href={`?cat=${c.id}`} onClick={(e) => { e.preventDefault(); setCat(c.id); }} aria-current={cat === c.id ? 'page' : undefined} style={cat === c.id ? { borderColor: 'var(--gold)', fontWeight: 600 } : undefined}>
            {c.label} ({counts.get(c.id)})
          </a>
        ))}
      </nav>

      {teachingBriefs.length === 0 && (
        <div className="card">
          <p style={{ margin: 0 }}>Teaching briefs are added here as they are verified. The <Link to="/briefs">weekly briefs</Link> carry the newest decisions.</p>
        </div>
      )}
      {teachingBriefs.length > 0 && results.length === 0 && <p className="meta">No cases match that search.</p>}

      {grouped && caseCategories.map((c) => {
        const inCat = teachingBriefs.filter((t) => (t.categories ?? [])[0] === c.id);
        if (inCat.length === 0) return null;
        return (
          <section key={c.id} id={c.id}>
            <div className="section-title"><h2>{c.label}</h2></div>
            <p className="meta">{c.blurb}</p>
            {inCat.map((t) => <CaseRow key={t.id} t={t} />)}
          </section>
        );
      })}
      {grouped && teachingBriefs.some((t) => !t.categories || t.categories.length === 0) && (
        <section id="other">
          <div className="section-title"><h2>Other cases</h2></div>
          {teachingBriefs.filter((t) => !t.categories || t.categories.length === 0).map((t) => <CaseRow key={t.id} t={t} />)}
        </section>
      )}
      {!grouped && (
        <>
          {cat && <p className="meta">{caseCategories.find((c) => c.id === cat)?.blurb}</p>}
          {results.map((t) => <CaseRow key={t.id} t={t} />)}
        </>
      )}
    </>
  );
}
