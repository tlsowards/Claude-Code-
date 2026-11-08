import { Link, useParams } from 'react-router-dom';
import Seo from '../components/Seo';
import { episodes, getEpisode, getBrief, formatDate } from '../data/content';
import { site, subscription } from '../config';
import NotFound from './NotFound';
import Paywall from '../components/Paywall';
import { useAuth } from '../data/auth';

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
  const { canAccess } = useAuth();
  const selected = id ? getEpisode(id) : episodes[0];
  if (id && !selected) return <NotFound />;
  const feedUrl = `${import.meta.env.BASE_URL}podcast/feed.xml`;

  return (
    <>
      <Seo title="Use of Force Case Law Update podcast" description="The weekly Use of Force Case Law Update podcast from Dr. Timothy Sowards." />
      <div className="page-intro">
        <img className="page-cover" src={`${import.meta.env.BASE_URL}images/podcast-cover.jpg`} alt="Use of Force Case Law Update podcast cover" width="800" height="800" />
        <div>
          <div className="eyebrow">Podcast</div>
          <h1>Use of Force Case Law Update</h1>
          <p className="lead">
            A weekly walk through the use of force decisions that matter to officers, custody staff, supervisors, and trainers. Hosted by {site.owner}.
          </p>
        </div>
      </div>
      <div className="btn-row">
        {site.spotifyUrl && <a className="btn secondary" href={site.spotifyUrl} target="_blank" rel="noopener noreferrer">Listen on Spotify</a>}
        {site.applePodcastsUrl && <a className="btn secondary" href={site.applePodcastsUrl} target="_blank" rel="noopener noreferrer">Listen on Apple Podcasts</a>}
        <a className="btn secondary" href={feedUrl} title="Public feed; episodes appear here four weeks after they air. Subscribers hear every episode here in the app the day it is published.">Public RSS feed</a>
        <Link className="btn secondary" to="/subscribe">Get new episodes by email</Link>
      </div>

      {selected && (
        <div className="player">
          <div className="eyebrow gold">Now playing</div>
          <h2 style={{ color: '#fff' }}>{selected.title}</h2>
          <div style={{ opacity: 0.85, fontSize: '0.9rem' }}>{formatDate(selected.date)}{selected.durationSeconds ? ` · ${minutes(selected.durationSeconds)}` : ''}</div>
          {audioUrl(selected) && !canAccess ? (
            <p style={{ marginTop: 10, marginBottom: 0, fontSize: '0.9rem' }}>Episodes play for subscribers. Start your free {subscription.trialDays} days below.</p>
          ) : audioUrl(selected) ? (
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

      {!canAccess && <Paywall what="every episode" />}

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
