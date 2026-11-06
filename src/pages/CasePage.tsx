import { Link, useParams } from 'react-router-dom';
import Seo from '../components/Seo';
import CaseCard from '../components/CaseCard';
import { getBrief, formatDate } from '../data/content';
import NotFound from './NotFound';

export default function CasePage() {
  const { id, caseId } = useParams();
  const brief = id ? getBrief(id) : undefined;
  const c = brief?.sections.flatMap((s) => s.cases).find((x) => x.id === caseId);
  if (!brief || !c) return <NotFound />;

  return (
    <>
      <Seo title={`${c.name}: what it means in practice and how to train it`} description={`${c.court}, ${c.decided}. ${c.inPractice}`} />
      <div className="eyebrow">Case brief · {formatDate(brief.date)}</div>
      <h1>{c.name}</h1>
      <p className="lead">{c.topic}. From the weekly brief <Link to={`/briefs/${brief.id}`}>{brief.title}</Link>.</p>
      <CaseCard c={c} briefId={brief.id} standalone />
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
