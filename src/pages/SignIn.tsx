import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Seo from '../components/Seo';
import { useAuth } from '../data/auth';
import { site, subscription } from '../config';

export default function SignIn() {
  const { signIn, error, loading, me } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const next = params.get('next') || '/account';

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (await signIn(username.trim(), password)) navigate(next, { replace: true });
  }

  if (me) {
    return (
      <>
        <Seo title="Signed in" />
        <h1>You are signed in</h1>
        <p>Signed in as {me.user.name}. <Link to="/account">Go to your account</Link>.</p>
      </>
    );
  }

  return (
    <>
      <Seo title="Sign in" description="Sign in to the Sowards Consulting app with your sowardsconsulting.com account." />
      <div className="eyebrow">Sign in</div>
      <h1>Use your sowardsconsulting.com account</h1>
      <p className="lead">The same username and password you use for the course portal. New here? <a href={site.subscribeUrl}>Start your free {subscription.trialDays} days</a> on the site first, then sign in.</p>
      <form className="card" onSubmit={onSubmit}>
        <div className="form-row">
          <label htmlFor="su">Username or email</label>
          <input id="su" type="text" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="form-row">
          <label htmlFor="sp">Password</label>
          <input id="sp" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <div className="callout warn">{error}</div>}
        <button className="btn" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
        <p className="meta" style={{ marginTop: 12, marginBottom: 0 }}>
          Forgot your password? <a href={`${site.website}/wp-login.php?action=lostpassword`}>Reset it on sowardsconsulting.com</a>.
        </p>
      </form>
    </>
  );
}
