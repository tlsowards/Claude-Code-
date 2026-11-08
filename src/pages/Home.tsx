import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { briefs, episodes, formatDate, formatRange } from '../data/content';
import { site } from '../config';

export default function Home() {
  const latest = briefs[0];
  const latestEpisode = episodes[0];
  return (
    <>
      <Seo />
      <section className="hero hero-figure">
        <div>
          <div className="eyebrow gold">Sowards Consulting</div>
          <h1>Training built for defensibility.</h1>
          <div className="gold-line" />
          <p>
            Weekly use of force case law briefs written for the people who do the work and the people who train them. The podcast, STC-certified courses, and a resource center for trainers, in one place.
          </p>
          <div className="btn-row">
            <Link className="btn" to="/briefs">Read this week's brief</Link>
            <Link className="btn secondary" to="/subscribe">Subscribe free</Link>
          </div>
        </div>
        <img className="hero-portrait" src={`${import.meta.env.BASE_URL}images/tim-sowards.jpg`} alt="Dr. Timothy Sowards" width="720" height="1020" />
      </section>

      {latest && (
        <Link to={`/briefs/${latest.id}`} className="card card-link card-with-image">
          <img className="card-image" src={`${import.meta.env.BASE_URL}images/banner-use-of-force.jpg`} alt="" width="1280" height="720" loading="lazy" />
          <div className="eyebrow">Latest weekly brief</div>
          <h2>{latest.title}</h2>
          <div className="meta">Decisions from {formatRange(latest.coverageStart, latest.coverageEnd)}</div>
          <p style={{ marginTop: 8 }}>{latest.summary}</p>
        </Link>
      )}

      <div className="grid two">
        {latestEpisode && (
          <Link to={`/podcast/${latestEpisode.id}`} className="card card-link card-with-image">
            <img className="card-image card-image-square" src={`${import.meta.env.BASE_URL}images/podcast-cover.jpg`} alt="" width="800" height="800" loading="lazy" />
            <div className="eyebrow">Latest episode</div>
            <h3>{latestEpisode.title}</h3>
            <div className="meta">{formatDate(latestEpisode.date)}</div>
          </Link>
        )}
        <Link to="/training" className="card card-link card-with-image">
          <img className="card-image" src={`${import.meta.env.BASE_URL}images/banner-de-escalation.jpg`} alt="" width="1280" height="720" loading="lazy" />
          <div className="eyebrow">STC-certified training</div>
          <h3>Online courses with certificates</h3>
          <div className="meta">Twelve courses live on the course portal. Preview any course free, or sign in to pick up where you left off.</div>
        </Link>
        <Link to="/downing-the-duck" className="card card-link card-with-image">
          <img className="card-image" src={`${import.meta.env.BASE_URL}images/banner-manipulation.jpg`} alt="" width="1280" height="720" loading="lazy" />
          <div className="eyebrow">Free framework</div>
          <h3>Downing the Duck</h3>
          <div className="meta">The six stages of staff manipulation in juvenile facilities, and where to stop it.</div>
        </Link>
        <Link to="/reference/pc835a" className="card card-link">
          <div className="eyebrow">Free reference</div>
          <h3>PC 835a after AB 392</h3>
          <div className="meta">Four framing errors corrected, and the documentation checklist.</div>
        </Link>
      </div>

      <div className="section-title"><h2>From the mat</h2><Link to="/training">See the courses</Link></div>
      <div className="photo-strip" aria-label="Training photos">
        <img className="photo" src={`${import.meta.env.BASE_URL}images/training/ground-control-1.jpg`} alt="Instructor demonstrating a ground control position on the mat" width="1050" height="1400" loading="lazy" />
        <img className="photo" src={`${import.meta.env.BASE_URL}images/training/handcuffing.jpg`} alt="Handcuffing technique practice during a defensive tactics course" width="1050" height="1400" loading="lazy" />
        <img className="photo" src={`${import.meta.env.BASE_URL}images/training/standing-control-2.jpg`} alt="Standing control hold practice between two officers" width="1050" height="1400" loading="lazy" />
        <img className="photo" src={`${import.meta.env.BASE_URL}images/training/whiteboard-ground-control.jpg`} alt="Ground control lesson notes on the training room wall" width="1050" height="1400" loading="lazy" />
      </div>

      <div className="card">
        <h2>How each brief is built</h2>
        <p>
          Every week the opinions are read from the courts' own websites, not news stories. Federal law comes first, starting with the Ninth Circuit and the Supreme Court, then the other circuits, then California. Each case ends with two things: what it means in practice, and how it should be trained. Where research could not be confirmed against a primary source, the brief says so.
        </p>
        <p className="meta">
          Need use of force training, expert review, or STC-certified courses for your agency? <a href={site.contactUrl}>Contact {site.name}</a>.
        </p>
      </div>
    </>
  );
}
