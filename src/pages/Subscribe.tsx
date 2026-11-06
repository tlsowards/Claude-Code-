import { useState, useEffect } from 'react';
import Seo from '../components/Seo';
import { site } from '../config';

export default function Subscribe() {
  const [canInstall, setCanInstall] = useState<null | (() => void)>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      const ev = e as Event & { prompt: () => Promise<void> };
      setCanInstall(() => () => ev.prompt());
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const standalone = typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches;

  return (
    <>
      <Seo title="Subscribe" description="Get the weekly use of force brief and new podcast episodes by email, and install the app on your phone." />
      <div className="eyebrow">Subscribe</div>
      <h1>Free. Every week.</h1>
      <p className="lead">The weekly brief and new podcast episodes, sent to your inbox. No cost, unsubscribe any time.</p>

      <div className="card">
        <h2>Email updates</h2>
        {site.mailerLiteFormAction ? (
          <form action={site.mailerLiteFormAction} method="post" target="_blank">
            <div className="form-row">
              <label htmlFor="sub-name">First name</label>
              <input id="sub-name" name="fields[name]" type="text" autoComplete="given-name" />
            </div>
            <div className="form-row">
              <label htmlFor="sub-email">Email address</label>
              <input id="sub-email" name="fields[email]" type="email" required autoComplete="email" />
            </div>
            <input type="hidden" name="ml-submit" value="1" />
            <button className="btn" type="submit">Send me the weekly brief</button>
          </form>
        ) : (
          <>
            <p>The signup form is not connected yet. Until it is, email <a href={`mailto:${site.email}?subject=Subscribe%20to%20the%20weekly%20use%20of%20force%20brief`}>{site.email}</a> with the subject "Subscribe" and you will be added by hand.</p>
            <a className="btn" href={`mailto:${site.email}?subject=Subscribe%20to%20the%20weekly%20use%20of%20force%20brief`}>Email to subscribe</a>
          </>
        )}
      </div>

      <div className="card">
        <h2>Install the app on your phone</h2>
        {installed || standalone ? (
          <p style={{ marginBottom: 0 }}>The app is installed. New briefs and episodes appear here automatically.</p>
        ) : (
          <>
            {canInstall && (
              <p><button className="btn" onClick={() => canInstall()}>Install now</button></p>
            )}
            <p><strong>iPhone and iPad.</strong> Open this page in Safari, tap the Share button, then tap <em>Add to Home Screen</em>.</p>
            <p><strong>Android.</strong> Open this page in Chrome, tap the menu, then tap <em>Install app</em> or <em>Add to Home screen</em>.</p>
            <p style={{ marginBottom: 0 }}><strong>Desktop.</strong> In Chrome or Edge, click the install icon at the right end of the address bar.</p>
          </>
        )}
      </div>

      <div className="card">
        <h2>Podcast apps</h2>
        <p>Add the RSS feed to any podcast app: <a href={`${import.meta.env.BASE_URL}podcast/feed.xml`}>feed.xml</a>. Apple Podcasts and Spotify listings are coming.</p>
      </div>

      <div className="card">
        <h2>Suggest a resource</h2>
        <p style={{ marginBottom: 0 }}>Know a California instructor, training center, or research source that belongs in the resource center? <a href={`mailto:${site.email}?subject=Resource%20suggestion`}>Send it</a>.</p>
      </div>
    </>
  );
}
