import PageHero from "../components/PageHero";
import { facilities } from "../data/collegeData";
import Icon from "../components/Icons";

export default function Facilities() {
  return (
    <>
      <PageHero
        crumb="Facilities"
        eyebrow="Campus life"
        title="Facilities that support learning beyond the classroom"
        text="From laboratories to hostel life, here's what's available on and around campus."
      />

      <section className="section">
        <div className="container">
          <div className="grid grid--4">
            {facilities.map((f) => (
              <div className="card facility-card" key={f.title}>
                <div className="icon-tile"><Icon name={f.icon} /></div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
