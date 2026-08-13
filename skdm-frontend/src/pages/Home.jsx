import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  college, stats, courses as staticCourses, facilities, founder, testimonials,
} from "../data/collegeData";
import SealBadge from "../components/SealBadge";
import NoticeTicker from "../components/NoticeTicker";
import Icon from "../components/Icons";
import { coursesApi } from "../services/api";

export default function Home() {
  const [courseList, setCourseList] = useState([]);

  useEffect(() => {
    coursesApi.getAll()
      .then((res) => {
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.map((c) => ({
            code: c.code || c.shortName,
            name: c.name,
            duration: c.durationYears ? `${c.durationYears} Years` : c.duration || "N/A",
            seats: c.totalSeats ?? c.seats ?? "N/A",
            eligibility: c.eligibility || "",
            subjects: Array.isArray(c.subjects) ? c.subjects : [],
          }));
          setCourseList(mapped);
        } else {
          setCourseList(staticCourses);
        }
      })
      .catch(() => setCourseList(staticCourses));
  }, []);
  return (
    <>
      <section className="hero">
        <div className="container">
          <div>
            <div className="hero-motto">{college.motto}</div>
            <span className="eyebrow">Est. {college.founded} · {college.village}, {college.district}</span>
            <h1>
              Educating rural <em>Pratapgarh</em>, one graduating class at a time.
            </h1>
            <p className="hero-lede">
              {college.name} is a degree college of the {college.trust}, affiliated to{" "}
              {college.affiliation} — built to bring accessible, quality higher education
              to the villages around the Pratapgarh, Jaunpur and Allahabad border.
            </p>
            <div className="hero-actions">
              <Link className="btn btn--primary" to="/admissions">Apply for Admission</Link>
              <Link className="btn btn--outline-ink" to="/courses">Explore Courses</Link>
            </div>
          </div>

          <div className="hero-panel">
            <SealBadge />
            <h3>{college.shortName} at a glance</h3>
            <p>A trusted institution for rural higher education</p>
            <div className="hero-panel-row">
              <div><strong>{stats[1].value}+</strong><span>Students</span></div>
              <div><strong>{stats[3].value}</strong><span>Programmes</span></div>
              <div><strong>{stats[0].value}+</strong><span>Years</span></div>
            </div>
          </div>
        </div>
      </section>

      <NoticeTicker />

      <section className="stats-band">
        <div className="container stats-grid">
          {stats.map((s) => (
            <div key={s.label}>
              <strong>{s.value}{s.suffix}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div>
            <div className="portrait">
              <span>SKM</span>
            </div>
            <div className="portrait-caption">Main campus, Ashapur village</div>
          </div>
          <div>
            <span className="eyebrow">About the college</span>
            <h2>Built for the socially left-behind, aimed at every student's future</h2>
            <p>
              {college.name} (SKM) is a graduate college affiliated to{" "}
              {college.affiliation}. Founded by visionary educationist Professor
              Ram Dev Dubey, SKM was set up to meet the modern higher-educational
              needs of the socially left-behind and rural communities of{" "}
              {college.district} district — home to roughly three million people who
              have long lagged behind in access to higher education.
            </p>
            <p>
              The college was launched at {college.village} village of{" "}
              {college.tehsil} tehsil in {college.founded}, and today operates as a
              key component of the {college.trust}, a not-for-profit educational
              trust that runs several institutions across the district.
            </p>
            <Link className="btn btn--primary" to="/about">Read Our Full Story</Link>
          </div>
        </div>
      </section>

      <section className="section section--dim">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Programmes offered</span>
            <h2>Degree courses built for real careers</h2>
            <p>A snapshot of our current undergraduate and postgraduate offerings.</p>
          </div>
          <div className="grid grid--3">
            {(courseList.length > 0 ? courseList : staticCourses).slice(0, 3).map((c, idx) => (
              <div className="card course-card" key={c.code || idx}>
                <span className="code">{c.code}</span>
                <h3>{c.name}</h3>
                <div className="course-meta">
                  <span>⏱ {c.duration}</span>
                  <span>🎓 {c.seats} seats</span>
                </div>
                <p style={{ color: "var(--slate-soft)", fontSize: 14 }}>{c.eligibility}</p>
                {c.subjects && c.subjects.length > 0 && (
                  <div className="course-tags">
                    {c.subjects.slice(0, 3).map((s) => <span key={s}>{s}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-lg">
            <Link className="btn btn--outline-ink" to="/courses">View All Courses</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split" style={{ alignItems: "center" }}>
          <div>
            <span className="eyebrow">Message from the founder</span>
            <h2>A welcome from {founder.name}</h2>
            <blockquote className="pull">
              “{founder.message.slice(0, 220)}…”
            </blockquote>
            <Link className="btn btn--primary" to="/about">Read Full Story</Link>
          </div>
          <div className="portrait" style={{ aspectRatio: "1/1" }}>
            {founder.image ? (
              <img src={founder.image} alt={founder.name} />
            ) : (
              <span>{founder.photoInitials}</span>
            )}
          </div>
        </div>
      </section>

      <section className="section section--dim">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Campus facilities</span>
            <h2>Everything a student needs on one campus</h2>
          </div>
          <div className="grid grid--4">
            {facilities.slice(0, 4).map((f) => (
              <div className="card facility-card" key={f.title}>
                <div className="icon-tile"><Icon name={f.icon} /></div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-lg">
            <Link className="btn btn--outline-ink" to="/facilities">See All Facilities</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Alumni voices</span>
            <h2>What our students say</h2>
          </div>
          <div className="grid grid--3">
            {testimonials.map((t) => (
              <div className="card testimonial-card" key={t.name}>
                <Icon name="quote" />
                <p className="quote">{t.quote}</p>
                <div className="testimonial-name">{t.name}</div>
                <div className="testimonial-batch">{t.batch}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-band">
            <div>
              <h2>Admissions Are Now Open for All Programmes</h2>
              <p>Secure your seat across our undergraduate and postgraduate programmes.</p>
            </div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Link className="btn btn--gold" to="/admissions">Start Application</Link>
              <Link className="btn btn--ghost" to="/contact">Talk to Us</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
