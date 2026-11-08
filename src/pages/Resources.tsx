import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { resourceCategories, resourceIntro } from '../data/content';

export default function Resources() {
  return (
    <>
      <Seo title="Trainer resource center" description="A curated resource center for law enforcement and corrections trainers: case law sources, California standards, research organizations, and free reference cards." />
      <div className="eyebrow">Resource center</div>
      <h1>Resources for trainers</h1>
      <p className="lead">{resourceIntro}</p>
      <img className="page-banner" src={`${import.meta.env.BASE_URL}images/art/resources-hero.jpg`} alt="Law books, a compass, a magnifying glass over a document and an outline of California" width="1536" height="1024" />
      <div className="photo-row">
        <img className="photo" src={`${import.meta.env.BASE_URL}images/training/training-gear.jpg`} alt="Training suit and protective gear hanging in the mat room" width="1050" height="1400" loading="lazy" />
        <img className="photo" src={`${import.meta.env.BASE_URL}images/training/mat-room-wide.jpg`} alt="Officers training on the mats in a wide shot of the room" width="1050" height="1400" loading="lazy" />
        <img className="photo" src={`${import.meta.env.BASE_URL}images/training/instructor-stance.jpg`} alt="Instructor demonstrating a ready stance" width="1050" height="1400" loading="lazy" />
      </div>
      <nav className="toc" aria-label="Categories">
        {resourceCategories.map((c) => <a key={c.id} href={`#${c.id}`}>{c.title}</a>)}
      </nav>
      {resourceCategories.map((cat) => (
        <section key={cat.id} id={cat.id}>
          <div className="section-title"><h2>{cat.title}</h2></div>
          <p className="meta">{cat.description}</p>
          {cat.links.length === 0 && <p className="callout">No entries yet. Listings here are added by Sowards Consulting.</p>}
          {cat.links.map((l) => (
            <div className="card" key={l.url}>
              <h3 style={{ marginBottom: 4 }}>
                {l.url.startsWith('/') ? <Link to={l.url}>{l.title}</Link> : <a href={l.url} target="_blank" rel="noopener">{l.title}</a>}
                {l.paid && <span className="pill muted" style={{ marginLeft: 8 }}>Subscription</span>}
              </h3>
              <p style={{ marginBottom: 0, fontSize: '0.93rem' }}>{l.description}</p>
            </div>
          ))}
        </section>
      ))}
    </>
  );
}
