import { Link, useParams } from 'react-router-dom';
import Seo from '../components/Seo';
import CaseCard from '../components/CaseCard';
import { getBrief, formatDate, previewCaseId, teachingBriefFor } from '../data/content';
import NotFound from './NotFound';
import Paywall from '../components/Paywall';
import { useAuth } from '../data/auth';

export default function CasePage() {
  const { id, caseId } = useParams();
  const brief = id ? getBrief(id) : undefined;
  const c = brief?.sections.flatMap((s) => s.cases).find((x) => x.id === caseId);
  const { canAccess } = useAuth();
  if (!brief || !c) return <NotFound />;
  const isPreview = previewCaseId(brief) === c.id;
  const teaching = teachingBriefFor(c);

  return (
    <>
      <Seo title={`${c.name}: what it means in practice and how to train it`} description={`${c.court}, ${c.decided}. ${c.inPractice}`} />
      <div className="eyebrow">Case brief · {formatDate(brief.date)}</div>
      <h1>{c.name}</h1>
      <p className="lead">{c.topic}. From the weekly brief <Link to={`/briefs/${brief.id}`}>{brief.title}</Link>.</p>
      {teaching && (
        <p className="meta">This case has a standalone teaching brief in the <Link to={`/cases/${teaching.id}`}>Case library</Link>.</p>
      )}
      {canAccess || isPreview ? (
        <CaseCard c={c} briefId={brief.id} standalone />
      ) : (
        <>
          <div className="case">
            <h3>{c.name}</h3>
            <div className="meta">{c.court} · {c.decided}</div>
            <div className="case-block"><span className="label">Topic</span>{c.topic}</div>
          </div>
          <Paywall what="the facts, holding, practice points, and training points for this case" />
        </>
      )}
      <div className="card">
        <h3>More from this week</h3>
        <ul style={{ marginBottom: 0 }}>
          {brief.sections.flatMap((s) => s.cases).filter((x) => x.id !== c.id).map((x) => (
            <li key={x.id}><Link to={`/briefs/${brief.id}/${x.id}`}>{x.name}</Link> <span className="meta">· {x.topic}</span></li>
          ))}
        </ul>
      </div>
      <p><Link to={`/briefs/${brief.id}`}>Back to the full weekly brief</Link> · <Link to="/briefs">All weekly briefs</Link></p>
    </>
  );
}
