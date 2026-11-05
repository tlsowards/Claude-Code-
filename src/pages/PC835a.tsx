import Seo from '../components/Seo';
import { pc835a } from '../data/content';

export default function PC835a() {
  return (
    <>
      <Seo title={pc835a.title} description={pc835a.subtitle} />
      <div className="eyebrow">Free quick reference</div>
      <h1>{pc835a.title}</h1>
      <p className="lead">{pc835a.subtitle}</p>
      {pc835a.intro.map((p, i) => <p key={i}>{p}</p>)}
      {pc835a.sections.map((s) => (
        <div className="card" key={s.title}>
          <h2>{s.title}</h2>
          {s.body.map((p, i) => <p key={i}>{p}</p>)}
          {s.checklist && (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Documentation element</th><th>Why it is required under PC 835a</th></tr></thead>
                <tbody>{s.checklist.map((r) => <tr key={r.element}><td><strong>{r.element}</strong></td><td>{r.why}</td></tr>)}</tbody>
              </table>
            </div>
          )}
          {s.training && (
            <ul>{s.training.map((t) => <li key={t.area}><strong>{t.area}.</strong> {t.detail}</li>)}</ul>
          )}
          {s.whatThisMeans && (
            <div className="case-block train" style={{ marginTop: 12 }}>
              <span className="label">What this means for you</span>{s.whatThisMeans}
            </div>
          )}
        </div>
      ))}
      <p className="meta">{pc835a.footer}</p>
    </>
  );
}
