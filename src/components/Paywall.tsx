import { Link, useLocation } from 'react-router-dom';
import { site, subscription } from '../config';
import { useAuth } from '../data/auth';

export default function Paywall({ what = 'the full brief' }: { what?: string }) {
  const { me, loading } = useAuth();
  const { pathname } = useLocation();
  if (loading) return <div className="card"><p className="meta" style={{ margin: 0 }}>Checking your subscription...</p></div>;
  return (
    <div className="card paywall">
      <div className="eyebrow">Subscribers only</div>
      <h2>Free for {subscription.trialDays} days, then {subscription.offer}</h2>
      <p>
        {subscription.name} gives you {what}, the audio episode, the printable roll call brief, and the knowledge check every week. Cancel any time from your account on sowardsconsulting.com.
      </p>
      <div className="btn-row">
        <a className="btn" href={site.subscribeUrl}>Start your free {subscription.trialDays} days</a>
        {!me && <Link className="btn secondary" to={`/signin?next=${encodeURIComponent(pathname)}`}>Already subscribed? Sign in</Link>}
      </div>
      {me && !me.subscription.active && (
        <p className="meta" style={{ marginBottom: 0 }}>
          You are signed in as {me.user.name}, but this account does not have an active subscription. Start one above, or <Link to="/account">check your account</Link>.
        </p>
      )}
    </div>
  );
}
