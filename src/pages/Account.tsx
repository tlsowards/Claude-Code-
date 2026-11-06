import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { useAuth } from '../data/auth';
import { site, subscription } from '../config';
import { formatDate } from '../data/content';

export default function Account() {
  const { me, loading, signOut, refresh } = useAuth();
  if (loading && !me) return <p className="meta">Loading your account...</p>;
  if (!me) {
    return (
      <>
        <Seo title="Account" />
        <h1>Your account</h1>
        <p>You are not signed in. <Link to="/signin">Sign in</Link> with your sowardsconsulting.com account.</p>
      </>
    );
  }
  const sub = me.subscription;
  return (
    <>
      <Seo title="Account" />
      <div className="eyebrow">Account</div>
      <h1>{me.user.name}</h1>
      <p className="meta">{me.user.email}</p>

      <div className="card">
        <h2>{subscription.name}</h2>
        {sub.active ? (
          <>
            <p><span className="pill">Active</span>{sub.status === 'staff' && <span className="pill muted">Staff access</span>}</p>
            {sub.trialEndsAt && <p>Free trial ends {formatDate(sub.trialEndsAt.slice(0, 10))}. After that, your plan renews at {subscription.offer}.</p>}
            {sub.nextPayment && <p>Next payment: {formatDate(sub.nextPayment.slice(0, 10))}.</p>}
            <p className="meta" style={{ marginBottom: 0 }}>Manage or cancel from <a href={site.dashboardUrl}>your dashboard on sowardsconsulting.com</a>.</p>
          </>
        ) : (
          <>
            <p>No active subscription on this account.</p>
            <a className="btn" href={site.subscribeUrl}>Start your free {subscription.trialDays} days</a>
          </>
        )}
      </div>

      <div className="section-title"><h2>My courses</h2><a href={site.dashboardUrl}>Open the course portal</a></div>
      {me.courses.length === 0 && <p className="meta">No course enrollments yet. <Link to="/training">Browse the catalog</Link>.</p>}
      {me.courses.map((c) => (
        <a className="card card-link" key={c.id} href={c.url}>
          <h3>{c.title}</h3>
          <div className="progress"><div className="progress-bar" style={{ width: `${Math.min(100, Math.round(c.progress))}%` }} /></div>
          <div className="meta">
            {c.completed ? 'Completed' : `${Math.round(c.progress)}% complete`}
            {c.certificate && <> · <a href={c.certificate}>View certificate</a></>}
          </div>
        </a>
      ))}

      <div className="btn-row">
        <button className="btn secondary" onClick={() => refresh()}>Refresh</button>
        <button className="btn secondary" onClick={() => signOut()}>Sign out</button>
      </div>
    </>
  );
}
