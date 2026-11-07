import Seo from '../components/Seo';
import { site } from '../config';

export default function About() {
  return (
    <>
      <Seo title="About" description="About Dr. Timothy Sowards and Sowards Consulting." />
      <div className="eyebrow">About</div>
      <h1>{site.owner}</h1>
      <p className="lead">{site.tagline}</p>
      <div className="card about-card">
        <img className="about-portrait" src={`${import.meta.env.BASE_URL}images/tim-sowards.jpg`} alt="Dr. Timothy Sowards" width="720" height="1020" />
        <p>
          Dr. Timothy Sowards, PhD, has trained peace officers for over 25 years and serves as a lead training officer and Lead Use of Force Instructor for the Sacramento County Probation Department. He holds a Doctorate in Public Policy and Administration with a criminal justice focus, has been a POST-certified instructor since 2004, and is a BSCC STC-certified trainer serving probation departments, corrections facilities, and law enforcement agencies throughout California.
        </p>
        <p>
          He teaches at CSU Sacramento, CSU Chico, and the Sacramento Regional Public Safety Training Center, and has been retained as a use of force expert and expert witness in more than 19 in-custody and juvenile facility matters, including PREA litigation.
        </p>
        <p style={{ marginBottom: 0 }}>
          Sowards Consulting LLC is an online and in-person consulting organization for use of force review, PREA and institutional casework, and STC-certified training. {site.location}.
        </p>
      </div>
      <div className="card">
        <h2>Contact</h2>
        <p style={{ marginBottom: 0 }}>
          <a href={`mailto:${site.email}`}>{site.email}</a><br />
          <a href={site.phoneHref}>{site.phone}</a><br />
          <a href={site.website}>sowardsconsulting.com</a>
        </p>
      </div>
    </>
  );
}
