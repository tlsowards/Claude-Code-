import Seo from '../components/Seo';
import { liveCourses, upcomingCourses, pricing, pricingNote, catalogNote, catalogFetchedAt, formatDate } from '../data/content';
import { site } from '../config';

export default function Training() {
  return (
    <>
      <Seo title="STC-certified training" description="STC-certified online and in-person courses from Sowards Consulting: use of force, de-escalation, report writing, PREA, Title 15, and more." />
      <div className="eyebrow">Training</div>
      <h1>STC-certified training. One discipline: defensibility.</h1>
      <p className="lead">
        Online courses are 3 to 4 hours, asynchronous, with avatar-led video lessons, knowledge checks, a written skill test, and a graded final. Students receive a certificate with the STC course number for agency credit filing. Preview any course free.
      </p>
      <div className="photo-row">
        <img className="photo wide" src={`${import.meta.env.BASE_URL}images/training/classroom.jpg`} alt="Dr. Sowards teaching a probation training class" width="1050" height="1400" loading="lazy" />
        <img className="photo wide" src={`${import.meta.env.BASE_URL}images/training/class-group.jpg`} alt="Defensive tactics instructor course class photo" width="1400" height="1050" loading="lazy" />
      </div>
      <div className="btn-row">
        <a className="btn" href={site.dashboardUrl}>Sign in to my courses</a>
        <a className="btn secondary" href={site.managerDashboardUrl}>Agency coordinator dashboard</a>
      </div>
      <p className="meta">
        {catalogNote}
        {catalogFetchedAt ? ` Last synced ${formatDate(catalogFetchedAt.slice(0, 10))}.` : ''}
      </p>

      <div className="section-title"><h2>Online courses ({liveCourses.length})</h2></div>
      <div className="grid two">
        {liveCourses.map((c) => (
          <a className="card card-link course-card" key={c.id} href={c.url}>
            {c.image && <img className="course-image" src={c.image} alt={c.title} loading="lazy" />}
            <div className="eyebrow">{c.track ?? 'All populations'}</div>
            <h3>{c.title}</h3>
            <div style={{ marginBottom: 8 }}>
              {c.stcNumber && <span className="pill">STC {c.stcNumber}</span>}
              {(c.hours || c.totalTime) && <span className="pill muted">{c.hours ?? c.totalTime}</span>}
              <span className="pill muted">Online now</span>
            </div>
            <p style={{ fontSize: '0.93rem' }}>{c.excerpt}</p>
            {c.audience && <div className="meta">{c.audience}</div>}
            <p style={{ marginTop: 10, marginBottom: 0 }}><span className="btn secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Preview free on the course portal</span></p>
          </a>
        ))}
      </div>

      {upcomingCourses.length > 0 && (
        <>
          <div className="section-title"><h2>In review and upcoming</h2></div>
          <div className="grid two">
            {upcomingCourses.map((c) => (
              <div className="card" key={c.id}>
                <h3>{c.title}</h3>
                <div style={{ marginBottom: 8 }}>
                  {c.hours && <span className="pill muted">{c.hours}</span>}
                  <span className="pill">{c.status === 'stc-review' ? 'In STC review' : 'Upcoming'}</span>
                </div>
                <p style={{ fontSize: '0.93rem' }}>{c.summary}</p>
                <div className="meta">{c.format}</div>
              </div>
            ))}
          </div>
        </>
      )}

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
