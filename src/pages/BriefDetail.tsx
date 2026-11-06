import { Link, useParams } from 'react-router-dom';
import Seo from '../components/Seo';
import CaseCard from '../components/CaseCard';
import Quiz from '../components/Quiz';
import Paywall from '../components/Paywall';
import { getBrief, getEpisode, formatRange, formatDate, previewCaseId } from '../data/content';
import type { Episode } from '../data/types';
import { site } from '../config';
import { useAuth } from '../data/auth';
import NotFound from './NotFound';

function shareBrief(title: string, text: string) {
  const url = window.location.href;
  if (navigator.share) {
    navigator.share({ title, text, url }).catch(() => undefined);
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => alert('Link copied. Paste it into an email or message.'));
  }
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function BriefDetail() {
  const { id } = useParams();
  const brief = id ? getBrief(id) : undefined;
  const { canAccess } = useAuth();
  if (!brief) return <NotFound />;

  const episodeLinks = brief.episodeIds.map(getEpisode).filter((e): e is Episode => Boolean(e));
  const briefUrl = `${site.publicUrl.replace(/\/$/, '')}${import.meta.env.BASE_URL}briefs/${brief.id}`;
  const caseCount = brief.sections.reduce((n, sec) => n + sec.cases.length, 0);
  const previewId = previewCaseId(brief);
  const previewCase = brief.sections.flatMap((sec) => sec.cases).find((c) => c.id === previewId);
  const firstSection = brief.sections.find((sec) => sec.cases.some((c) => c.id === previewId));

  return (
    <>
      <Seo title={brief.title} description={brief.summary} />
      <div className="screen-only">
        <div className="eyebrow">Weekly brief · {formatDate(brief.date)}</div>
        <h1>{brief.title}</h1>
        <div className="meta">Decisions from {formatRange(brief.coverageStart, brief.coverageEnd)}</div>
        <p className="lead" style={{ marginTop: 12 }}>{brief.summary}</p>

        {canAccess && (
          <div className="btn-row no-print">
            <button className="btn" onClick={() => window.print()}>Print roll call brief</button>
            <button className="btn secondary" onClick={() => shareBrief(brief.title, brief.summary)}>Share with your training sergeant</button>
          </div>
        )}

        {episodeLinks.length > 0 && (
          <div className="callout">
            <strong>Listen.</strong>{' '}
            {episodeLinks.map((e, i) => (
              <span key={e.id}>
                {i > 0 ? ' · ' : ''}
                <Link to={`/podcast/${e.id}`}>{formatDate(e.date)} episode</Link>
              </span>
            ))}
          </div>
        )}

        <div className="card">
          <h3>Research coverage this week</h3>
          <ul style={{ marginBottom: 0 }}>
            {brief.coverage.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>

        {!canAccess && (
          <>
            {firstSection && previewCase && (
              <section>
                <div className="section-title"><h2>{firstSection.heading}</h2></div>
                <p className="meta">Preview: the first case of this week's brief.</p>
                <CaseCard c={previewCase} briefId={brief.id} />
              </section>
            )}
            <Paywall what={`every case in this brief, ${caseCount} this week`} />
          </>
        )}

        {canAccess && (
          <>
            <nav className="toc" aria-label="Sections">
              {brief.sections.map((s) => (
                <a key={s.heading} href={`#${slug(s.heading)}`}>{s.heading}</a>
              ))}
              <a href="#application">Training application</a>
            </nav>

            {brief.sections.map((s) => (
              <section key={s.heading} id={slug(s.heading)}>
                <div className="section-title"><h2>{s.heading}</h2></div>
                {s.note && <p className="meta">{s.note}</p>}
                {s.cases.map((c) => (
                  <CaseCard key={c.id} c={c} briefId={brief.id} />
                ))}
              </section>
            ))}

            <section id="application">
              <div className="section-title"><h2>Training application</h2></div>
              <p className="meta">The points to take into a briefing room or training block this week.</p>
              {brief.applications.map((a, i) => (
                <div className="card" key={i}>
                  <h3>{i + 1}. {a.title}</h3>
                  <p style={{ marginBottom: 0 }}>{a.body}</p>
                </div>
              ))}
            </section>

            {brief.quiz && brief.quiz.length > 0 && <Quiz questions={brief.quiz} />}
          </>
        )}

        <p><Link to="/briefs">All weekly briefs</Link></p>
      </div>

      {canAccess && (
        <div className="print-only roll-call">
          <div className="roll-call-head">
            <div><strong>{site.name}</strong> · Weekly Use of Force Roll Call Brief · {formatDate(brief.date)}</div>
            <div>Read the full brief and listen to the episode at {briefUrl.replace(/^https?:\/\//, '')}</div>
          </div>
          <h2 style={{ marginTop: 8 }}>{brief.title}</h2>
          <p className="meta">Decisions from {formatRange(brief.coverageStart, brief.coverageEnd)}. Unpublished decisions are not precedent. Educational material, not legal advice. Confirm with agency policy and counsel.</p>
          <table className="roll-call-table">
            <thead><tr><th>Case</th><th>What happened</th><th>Train it</th></tr></thead>
            <tbody>
              {brief.sections.flatMap((s) => s.cases).map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.name}</strong><br /><span className="meta">{c.court}, {c.decided}{c.status !== 'published' ? ' (unpublished)' : ''}</span></td>
                  <td>{c.inPractice}</td>
                  <td>{c.trainIt}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3>This week in the briefing room</h3>
          <ol>
            {brief.applications.map((a, i) => <li key={i}><strong>{a.title}.</strong> {a.body}</li>)}
          </ol>
        </div>
      )}
    </>
  );
}
