import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { site, disclaimer } from '../config';
import { useAuth } from '../data/auth';
import { HomeIcon, BriefIcon, PodcastIcon, TrainingIcon, ResourcesIcon } from './Icons';

const nav = [
  { to: '/', label: 'Home', icon: HomeIcon, end: true },
  { to: '/briefs', label: 'Briefs', icon: BriefIcon },
  { to: '/podcast', label: 'Podcast', icon: PodcastIcon },
  { to: '/training', label: 'Training', icon: TrainingIcon },
  { to: '/resources', label: 'Resources', icon: ResourcesIcon },
];

export default function Layout() {
  const { pathname } = useLocation();
  const { me } = useAuth();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="brand" aria-label={`${site.name} home`}>
          <img className="brand-mark" src={`${import.meta.env.BASE_URL}icons/brand-mark.png`} alt="" width="40" height="44" />
          <span>
            <span className="brand-name">{site.name}</span>
            <span className="brand-sub">{site.tagline}</span>
          </span>
        </Link>
        <nav className="topnav" aria-label="Primary">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              {n.label}
            </NavLink>
          ))}
          <NavLink to="/subscribe" className={({ isActive }) => (isActive ? 'active' : '')}>Subscribe</NavLink>
          {me ? (
            <NavLink to="/account" className={({ isActive }) => (isActive ? 'active' : '')}>Account</NavLink>
          ) : (
            <NavLink to="/signin" className={({ isActive }) => (isActive ? 'active' : '')}>Sign in</NavLink>
          )}
        </nav>
      </header>
      <main>
        <Outlet />
        <p className="notice">{disclaimer}</p>
      </main>
      <footer className="footer">
        <div>
          {site.name} LLC · <a href={site.website}>sowardsconsulting.com</a> · <a href={`mailto:${site.email}`}>{site.email}</a> · <a href={site.phoneHref}>{site.phone}</a>
        </div>
        <div>{site.location}. STC-certified training for California probation and corrections. <Link to="/about">About</Link> · <a href={`${site.website}/privacy-policy/`}>Privacy policy</a></div>
        <div>Subscriptions renew monthly after the free trial and can be cancelled any time from your account on sowardsconsulting.com. Educational material, not legal advice.</div>
      </footer>
      <nav className="bottomnav" aria-label="Primary">
        {nav.map((n) => {
          const Icon = n.icon;
          return (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              <Icon />
              <span>{n.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
