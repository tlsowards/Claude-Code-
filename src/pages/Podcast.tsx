import { Link, useParams } from 'react-router-dom';
import Seo from '../components/Seo';
import { episodes, getEpisode, getBrief, formatDate } from '../data/content';
import { site } from '../config';
import NotFound from './NotFound';

function audioUrl(e: { file: string; audioUrl?: string }) {
  if (e.audioUrl) return e.audioUrl;
  if (!site.audioBaseUrl) return '';
  return `${site.audioBaseUrl.replace(/\/$/, '')}/${e.file}`;
}

function minutes(sec?: number) {
  return sec ? `${Math.round(sec / 60)} min` : '';
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
          <div style={{ opacity: 0.85, fontSize: '0.9rem' }}>{formatDate(selected.date)}{selected.durationSeconds ? ` · ${minutes(selected.durationSeconds)}` : ''}</div>
          {audioUrl(selected) ? (
            <audio controls preload="metadata" src={audioUrl(selected)} />
          ) : (
            <p style={{ marginTop: 10, marginBottom: 0, fontSize: '0.9rem' }}>
              The recording for this episode is being uploaded. The written brief is available now.
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
          <div className="meta">{formatDate(e.date)}{e.durationSeconds ? ` · ${minutes(e.durationSeconds)}` : ''}{!audioUrl(e) ? ' · audio coming' : ''}</div>
          <p style={{ marginTop: 6, marginBottom: 0, fontSize: '0.92rem' }}>{e.description}</p>
        </Link>
      ))}
    </>
  );
}
