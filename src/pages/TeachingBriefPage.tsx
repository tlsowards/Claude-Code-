import { Link, useParams } from 'react-router-dom';
import Seo from '../components/Seo';
import CaseCard, { statusLabel } from '../components/CaseCard';
import Quiz from '../components/Quiz';
import Paywall from '../components/Paywall';
import { getTeachingBrief, briefsCiting, formatDate, formatRange, leadAndRest } from '../data/content';
import { courtSites, courtListenerSearch } from '../data/courts';
import { useAuth } from '../data/auth';
import NotFound from './NotFound';

/**
 * A standalone teaching brief from the Case library. The summary, facts, and holding are free to read;
 * the practice and training points, briefing room points, and knowledge check are for subscribers,
 * the same rule the weekly briefs follow.
 */
export default function TeachingBriefPage() {
  const { slug } = useParams();
  const t = slug ? getTeachingBrief(slug) : undefined;
  const { canAccess } = useAuth();
  if (!t) return <NotFound />;
  const court = courtSites[t.courtKey];
  const related = briefsCiting(t);
  const summary = leadAndRest(t.summary);

  return (
    <>
      <Seo title={`${t.name}: what it means in practice and how to train it`} description={`${t.court}, ${t.decided}. ${t.summary}`} />
      <div className="eyebrow">Case library · Added {formatDate(t.published)}</div>
      <h1>{t.name}</h1>
      <p className="lead">{summary.lead}</p>
      {summary.rest && <p>{summary.rest}</p>}
      {t.coverage && t.coverage.length > 0 && (
        <div className="callout">
          <strong>How this brief was checked.</strong> {t.coverage.join(' ')}
        </div>
      )}
      {canAccess ? (
        <>
          <CaseCard c={t} briefId={t.id} standalone />
          {t.context && t.context.length > 0 && t.context.map((x, i) => (
            <section key={i}>
              <div className="section-title"><h2>{x.title}</h2></div>
              <div className="card"><p style={{ margin: 0, whiteSpace: 'pre-line' }}>{x.body}</p></div>
            </section>
          ))}
          {t.applications && t.applications.length > 0 && (
            <section>
              <div className="section-title"><h2>Briefing room points</h2></div>
              <div className="card">
                <ol style={{ margin: 0, paddingLeft: 20 }}>
                  {t.applications.map((a, i) => <li key={i} style={{ marginBottom: 8 }}><strong>{a.title}.</strong> {a.body}</li>)}
                </ol>
              </div>
            </section>
          )}
          {t.quiz && t.quiz.length > 0 && <Quiz questions={t.quiz} />}
        </>
      ) : (
        <>
          <article className="case" id={t.id}>
            <h3>{t.name}</h3>
            <div className="meta">
              {t.court}
              {t.docket ? ` · No. ${t.docket}` : ''}
              {t.citation ? ` · ${t.citation}` : ''}
              {` · ${t.decided}`}
            </div>
            <div>
              <span className={`pill ${t.status === 'published' ? '' : 'muted'}`}>{statusLabel[t.status]}</span>
              <span className="pill red">{t.topic}</span>
            </div>
            {t.caution && <div className="callout warn"><strong>Verification note.</strong> {t.caution}</div>}
            <div className="case-block"><span className="label">Facts</span>{t.facts}</div>
            <div className="case-block"><span className="label">Holding</span>{t.holding}</div>
            <div className="meta">
              Read the opinion: <a href={court.url} target="_blank" rel="noopener">{court.name}</a> ·{' '}
              <a href={courtListenerSearch(t.name)} target="_blank" rel="noopener">search CourtListener</a>
            </div>
          </article>
          <Paywall what="the practice points, training points, briefing room points, and knowledge check for this case" />
        </>
      )}
      {related.length > 0 && (
        <div className="card">
          <h3>Weekly briefs that discuss this case</h3>
          <ul style={{ marginBottom: 0 }}>
            {related.map((b) => (
              <li key={b.id}><Link to={`/briefs/${b.id}`}>{b.title}</Link> <span className="meta">· {formatRange(b.coverageStart, b.coverageEnd)}</span></li>
            ))}
          </ul>
        </div>
      )}
      <p><Link to="/cases">Back to the Case library</Link> · <Link to="/briefs">Weekly briefs</Link></p>
    </>
  );
}
