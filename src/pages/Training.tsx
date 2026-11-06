import Seo from '../components/Seo';
import { courses, pricing, pricingNote, catalogNote } from '../data/content';
import { site } from '../config';

const statusText: Record<string, string> = {
  live: 'Online now',
  'stc-review': 'In STC review',
  'in-development': 'In development',
  'in-person': 'In person',
};

export default function Training() {
  const online = courses.filter((c) => c.status === 'live');
  const other = courses.filter((c) => c.status !== 'live');
  return (
    <>
      <Seo title="STC-certified training" description="STC-certified online and in-person courses from Sowards Consulting: use of force, de-escalation, report writing, PREA, and more." />
      <div className="eyebrow">Training</div>
      <h1>STC-certified training. One discipline: defensibility.</h1>
      <p className="lead">
        Online courses are 3 to 4 hours, asynchronous, with scenarios, knowledge checks, a written skill test, and a graded final. Students receive a certificate with the STC course number for agency credit filing. Preview any course free.
      </p>
      <div className="btn-row">
        <a className="btn" href={site.coursesUrl}>Open the course portal</a>
        <a className="btn secondary" href={site.contactUrl}>Schedule in-person training</a>
      </div>
      <p className="callout">{catalogNote}</p>

      <div className="section-title"><h2>Online courses</h2></div>
      <div className="grid two">
        {online.map((c) => (
          <div className="card" key={c.id}>
            <div className="eyebrow">{c.track ?? 'All populations'}</div>
            <h3>{c.title}</h3>
            <div style={{ marginBottom: 8 }}>
              {c.stcNumber && <span className="pill">STC {c.stcNumber}</span>}
              {c.hours && <span className="pill muted">{c.hours}</span>}
              <span className="pill muted">{statusText[c.status]}</span>
            </div>
            <p style={{ fontSize: '0.93rem' }}>{c.summary}</p>
            <ul style={{ fontSize: '0.9rem', marginBottom: 10 }}>
              {c.outcomes.map((o) => <li key={o}>{o}</li>)}
            </ul>
            <div className="meta">{c.audience}</div>
            {c.url && <p style={{ marginTop: 10, marginBottom: 0 }}><a href={c.url}>Preview this course</a></p>}
          </div>
        ))}
      </div>

      <div className="section-title"><h2>In-person and upcoming</h2></div>
      <div className="grid two">
        {other.map((c) => (
          <div className="card" key={c.id}>
            <h3>{c.title}</h3>
            <div style={{ marginBottom: 8 }}>
              {c.hours && <span className="pill muted">{c.hours}</span>}
              <span className="pill">{statusText[c.status]}</span>
            </div>
            <p style={{ fontSize: '0.93rem' }}>{c.summary}</p>
            <div className="meta">{c.format}</div>
          </div>
        ))}
      </div>

      <div className="section-title"><h2>Per-officer licensing, one course</h2></div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Plan</th><th>Seats</th><th>Price</th><th>Per officer</th></tr></thead>
            <tbody>
              {pricing.map((p) => (
                <tr key={p.name}><td><strong>{p.name}</strong></td><td>{p.seats}</td><td>{p.price}</td><td>{p.perOfficer}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="meta" style={{ marginTop: 10, marginBottom: 0 }}>{pricingNote}</p>
      </div>

      <div className="card">
        <h2>Expert witness and agency consulting</h2>
        <p>
          Use of force review, PREA and institutional casework, policy and training audits, and expert witness analysis and testimony in use of force, PREA, staff misconduct, and training standards matters.
        </p>
        <a className="btn" href={site.contactUrl}>Contact {site.name}</a>
      </div>
    </>
  );
}
