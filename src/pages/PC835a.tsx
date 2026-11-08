import Seo from '../components/Seo';
import { pc835a } from '../data/content';

export default function PC835a() {
  return (
    <>
      <Seo title={pc835a.title} description={pc835a.subtitle} />
      <div className="eyebrow">Free quick reference</div>
      <h1>{pc835a.title}</h1>
      <p className="lead">{pc835a.subtitle}</p>
      <img className="page-banner" src={`${import.meta.env.BASE_URL}images/art/pc835a-card.jpg`} alt="" width="1280" height="854" />
      <div className="photo-row">
        <img className="photo" src={`${import.meta.env.BASE_URL}images/training/ground-control-2.jpg`} alt="Ground control practice, officer controlling a resisting training partner" width="1050" height="1400" loading="lazy" />
        <img className="photo" src={`${import.meta.env.BASE_URL}images/training/standing-control-1.jpg`} alt="Standing control technique practice" width="1050" height="1400" loading="lazy" />
        <img className="photo" src={`${import.meta.env.BASE_URL}images/training/ground-control-3.jpg`} alt="Ground control practice from the side" width="1050" height="1400" loading="lazy" />
      </div>
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
