import { Link, useParams } from 'react-router-dom';
import Seo from '../components/Seo';
import { episodes, getEpisode, getBrief, formatDate } from '../data/content';
import { site } from '../config';
import NotFound from './NotFound';

function audioUrl(file: string) {
  if (!site.audioBaseUrl) return '';
  return `${site.audioBaseUrl.replace(/\/$/, '')}/${file}`;
}

export default function Podcast() {
  const { id } = useParams();
  const selected = id ? getEpisode(id) : episodes[0];
  if (id && !selected) return <NotFound />;
  const feedUrl = `${import.meta.env.BASE_URL}podcast/feed.xml`;

  return (
    <>
      <Seo title="Use of Force Case Law Update podcast" description="The weekly Use of Force Case Law Update podcast from Dr. Timothy Sowards." />
      <div className="eyebrow">Podcast</div>
      <h1>Use of Force Case Law Update</h1>
      <p className="lead">
        A weekly walk through the use of force decisions that matter to officers, custody staff, supervisors, and trainers. Hosted by {site.owner}.
      </p>
      <div className="btn-row">
        <a className="btn secondary" href={feedUrl}>RSS feed</a>
        <Link className="btn secondary" to="/subscribe">Get new episodes by email</Link>
      </div>

      {selected && (
        <div className="player">
          <div className="eyebrow gold">Now playing</div>
          <h2 style={{ color: '#fff' }}>{selected.title}</h2>
          <div style={{ opacity: 0.85, fontSize: '0.9rem' }}>{formatDate(selected.date)}</div>
          {audioUrl(selected.file) ? (
            <audio controls preload="none" src={audioUrl(selected.file)} />
          ) : (
            <p style={{ marginTop: 10, marginBottom: 0, fontSize: '0.9rem' }}>
              Audio is not connected yet. Episode files will play here once the audio host is configured.
            </p>
          )}
          <p style={{ marginTop: 10, marginBottom: 0 }}>{selected.description}</p>
          {selected.briefId && getBrief(selected.briefId) && (
            <p style={{ marginTop: 10, marginBottom: 0 }}>
              <Link to={`/briefs/${selected.briefId}`}>Read the written brief for this episode</Link>
            </p>
          )}
        </div>
      )}

      <div className="section-title"><h2>All episodes</h2></div>
      {episodes.map((e) => (
        <Link key={e.id} to={`/podcast/${e.id}`} className="card card-link" style={e.id === selected?.id ? { borderColor: 'var(--gold)' } : undefined}>
          <h3>{e.title}</h3>
          <div className="meta">{formatDate(e.date)}</div>
          <p style={{ marginTop: 6, marginBottom: 0, fontSize: '0.92rem' }}>{e.description}</p>
        </Link>
      ))}
    </>
  );
}
