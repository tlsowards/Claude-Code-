import { Link } from 'react-router-dom';
import type { BriefCase } from '../data/types';
import { courtSites, courtListenerSearch } from '../data/courts';

const statusLabel: Record<BriefCase['status'], string> = {
  published: 'Published',
  unpublished: 'Unpublished, not precedent',
  order: 'Order',
  'cert-denied': 'Review denied',
  'summary-order': 'Summary order',
  unknown: 'Publication status not confirmed',
};

const settingLabel: Record<string, string> = {
  field: 'Field',
  custody: 'Custody',
  juvenile: 'Juvenile',
  supervisors: 'Supervisors',
  all: 'All settings',
};

export default function CaseCard({ c, briefId, standalone }: { c: BriefCase; briefId: string; standalone?: boolean }) {
  const court = courtSites[c.courtKey];
  return (
    <article className="case" id={c.id}>
      <h3>{c.name}</h3>
      <div className="meta">
        {c.court}
        {c.docket ? ` · No. ${c.docket}` : ''}
        {c.citation ? ` · ${c.citation}` : ''}
        {` · ${c.decided}`}
      </div>
      <div>
        <span className={`pill ${c.status === 'published' ? '' : 'muted'}`}>{statusLabel[c.status]}</span>
        <span className="pill red">{c.topic}</span>
        {c.settings.map((s) => (
          <span key={s} className="pill">{settingLabel[s]}</span>
        ))}
      </div>
      {c.caution && <div className="callout warn"><strong>Verification note.</strong> {c.caution}</div>}
      <div className="case-block"><span className="label">Facts</span>{c.facts}</div>
      <div className="case-block"><span className="label">Holding</span>{c.holding}</div>
      {c.dissent && <div className="case-block"><span className="label">Dissent or concurrence</span>{c.dissent}</div>}
      {c.notDecided && <div className="case-block"><span className="label">What was not decided</span>{c.notDecided}</div>}
      <div className="case-block practice"><span className="label">What this means in practice</span>{c.inPractice}</div>
      <div className="case-block train"><span className="label">How to train it</span>{c.trainIt}</div>
      <div className="meta">
        Read the opinion: <a href={court.url} target="_blank" rel="noopener">{court.name}</a> ·{' '}
        <a href={courtListenerSearch(c.name)} target="_blank" rel="noopener">search CourtListener</a>
        {!standalone && (
          <> · <Link to={`/briefs/${briefId}/${c.id}`}>link to this case</Link></>
        )}
      </div>
    </article>
  );
}
