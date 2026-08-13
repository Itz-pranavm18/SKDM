import PageHero from "../components/PageHero";
import { college, aboutMilestones, mission, founder } from "../data/collegeData";

export default function About() {
  return (
    <>
      <PageHero
        crumb="About Us"
        eyebrow="Our story"
        title="A college founded on egalitarian conviction"
        text={`Why ${college.shortName} exists, who built it, and what it stands for.`}
      />

      <section className="section section--dim">
        <div className="container split">
          <div>
            <div className="portrait">
              {founder.image ? (
                <img src={founder.image} alt={founder.name} />
              ) : (
                <span>{founder.photoInitials}</span>
              )}
            </div>
            <div className="portrait-caption">{founder.name}, {founder.title}</div>
          </div>
          <div>
            <span className="eyebrow">Message from the founder</span>
            <h2>A vision shaped for rural uplift and modern education</h2>
            <blockquote className="pull">“{founder.message}”</blockquote>
            <p>{founder.messageClose}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div>
            <span className="eyebrow">History</span>
            <h2>From one visionary's idea to a district-wide trust</h2>
            <p>
              {college.name} (SKM) is a Graduate College affiliated to{" "}
              {college.affiliation}. Founded by a great visionary, educationist,
              scholarly professor and former legislator, the late Professor Ram Dev
              Dubey, SKM was primarily aimed at catering to the modern higher
              educational needs of the socially left-behind, downtrodden and
              rock-bottom strata of society.
            </p>
            <p>
              Located close to the borders of three districts — Pratapgarh, Jaunpur
              and Allahabad — SKM translates his vision to channel the talents and
              energies of rural youth by equipping them with the tools of modern
              education and skills. {college.district} district itself has a
              population of roughly three million, and has long lagged behind in
              higher education. It was to fill this vacuum that Professor Dubey
              launched the degree college at {college.village} village of{" "}
              {college.tehsil} tehsil in {college.founded}.
            </p>
            <p>
              The college is a key component of an educational initiative conceived
              by Professor Dubey to fulfil the dreams of his wife, the late Shiv
              Kumari Dubey, who epitomised human compassion during her lifetime as a
              devoted social worker and political leader. Following her passing, the
              initiative took the shape of a reputed not-for-profit educational NGO
              of eastern Uttar Pradesh — the {college.trust} — registered under the
              Cooperative Societies Act, which today runs over half-a-dozen
              educational institutions in {college.district} district.
            </p>
          </div>
          <div className="timeline">
            {aboutMilestones.map((m) => (
              <div className="timeline-item" key={m.year}>
                <div className="timeline-year">{m.year}</div>
                <p style={{ marginTop: 6 }}>{m.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--dim">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">What guides us</span>
            <h2>Mission, vision and values</h2>
          </div>
          <div className="grid grid--3">
            {mission.map((m) => (
              <div className="card" key={m.title}>
                <h3>{m.title}</h3>
                <p style={{ color: "var(--slate-soft)" }}>{m.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
