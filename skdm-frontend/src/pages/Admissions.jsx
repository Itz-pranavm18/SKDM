import PageHero from "../components/PageHero";
import { admissionSteps, feeStructure, college } from "../data/collegeData";

export default function Admissions() {
  return (
    <>
      <PageHero
        crumb="Admissions"
        eyebrow="Session 2026–27"
        title="How to join SKM"
        text="A simple, five-step process from application to document verification."
      />

      <section className="section">
        <div className="container">
          <div className="steps-row">
            {admissionSteps.map((s) => (
              <div className="card step-card" key={s.step}>
                <div className="step-num">{s.step}</div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--dim">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Fee structure</span>
            <h2>Indicative annual fees by programme</h2>
          </div>
          <table className="fee-table">
            <thead>
              <tr>
                <th>Programme</th>
                <th>Tuition</th>
                <th>Other charges</th>
              </tr>
            </thead>
            <tbody>
              {feeStructure.map((f) => (
                <tr key={f.programme}>
                  <td>{f.programme}</td>
                  <td>{f.tuition}</td>
                  <td>{f.other}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="table-note">
            Figures shown are placeholder/dummy values for layout purposes — replace with the
            latest fee notification published by {college.shortName}.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="split">
            <div>
              <span className="eyebrow">Eligibility checklist</span>
              <h2>Before you apply</h2>
              <div className="two-col-list mt-lg">
                {[
                  "Valid 10+2 / graduation mark-sheet",
                  "Transfer certificate from previous institution",
                  "Character certificate",
                  "Category certificate (if applicable)",
                  "Aadhaar card copy",
                  "4 passport-size photographs",
                ].map((item) => (
                  <div className="check-item" key={item}>
                    <span className="dot">✓</span> {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h3>Need help with your application?</h3>
              <p style={{ color: "var(--slate-soft)" }}>
                Our admissions desk is open Monday to Saturday, 10:00 AM – 4:00 PM,
                during the admission window.
              </p>
              <p><strong>Email:</strong> {college.admissionsEmail}</p>
              <p><strong>Phone:</strong> {college.phone}</p>
              <a className="btn btn--primary" href="#top">Download Prospectus (PDF)</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
