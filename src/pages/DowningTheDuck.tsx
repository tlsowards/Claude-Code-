import Seo from '../components/Seo';
import { duck } from '../data/content';
import { site } from '../config';

export default function DowningTheDuck() {
  return (
    <>
      <Seo title={duck.title} description={duck.subtitle} />
      <div className="eyebrow">Free quick reference</div>
      <h1>{duck.title}</h1>
      <p className="lead">{duck.subtitle}</p>
      <img className="page-banner" src={`${import.meta.env.BASE_URL}images/banner-manipulation.jpg`} alt="Manipulation and boundary violations: recognize, interrupt, prevent" width="1280" height="720" />
      {duck.intro.map((p, i) => <p key={i}>{p}</p>)}

      <div className="card">
        <h2>Why this matters: the PREA connection</h2>
        <p style={{ marginBottom: 0 }}>{duck.preaConnection}</p>
      </div>

      <div className="section-title"><h2>The six stages of manipulation</h2></div>
      {duck.stages.map((s) => (
        <div className={`card stage ${s.number >= 5 ? 'danger' : ''}`} key={s.number}>
          <div className="stage-num">{s.number}</div>
          <div>
            <h3>Stage {s.number}. {s.title}</h3>
            <p>{s.body}</p>
            {s.bullets && <ul>{s.bullets.map((b) => <li key={b}>{b}</li>)}</ul>}
            <div className="callout warn" style={{ margin: '8px 0 0' }}><strong>Warning sign.</strong> {s.warningSign}</div>
          </div>
        </div>
      ))}

      <div className="card" style={{ borderColor: 'var(--gold)' }}>
        <h2>{duck.interventionPrinciple.title}</h2>
        <p style={{ marginBottom: 0 }}>{duck.interventionPrinciple.body}</p>
      </div>
      <div className="card">
        <h2>{duck.supervisors.title}</h2>
        <p>Supervisors play a critical role in interrupting the manipulation process. Effective supervisors:</p>
        <ul style={{ marginBottom: 0 }}>{duck.supervisors.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
      </div>
      <div className="card">
        <h3>Train it</h3>
        <p>The online course <strong>Preventing Manipulation and Grooming in Juvenile Facilities</strong> builds this framework into scenarios, knowledge checks, and a certificate. <a href={site.coursesUrl}>Preview it free</a>.</p>
      </div>
    </>
  );
}
