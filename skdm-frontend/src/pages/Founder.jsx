import PageHero from "../components/PageHero";
import { founder } from "../data/collegeData";

export default function Founder() {
  return (
    <>
      <PageHero
        crumb="Founder"
        eyebrow="Message from the founder chairman"
        title={founder.name}
        text={founder.title}
      />

      <section className="section">
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
            <span className="eyebrow">In his own words</span>
            <blockquote className="pull">“{founder.message}”</blockquote>
            <p>{founder.messageClose}</p>
          </div>
        </div>
      </section>

      <section className="section section--dim">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Biography</span>
            <h2>A life dedicated to rural education</h2>
          </div>
          <p style={{ maxWidth: 780, fontSize: 16.5 }}>{founder.bio}</p>
        </div>
      </section>
    </>
  );
}
