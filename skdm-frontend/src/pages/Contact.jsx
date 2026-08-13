import { useState } from "react";
import PageHero from "../components/PageHero";
import { college } from "../data/collegeData";
import Icon from "../components/Icons";
import { contactApi } from "../services/api";

export default function Contact() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    subject: "Admission Enquiry",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await contactApi.submit(formData);
      setSuccessMsg(res.message || "Thank you! Your message has been sent successfully.");
      setFormData({
        fullName: "",
        phone: "",
        email: "",
        subject: "Admission Enquiry",
        message: "",
      });
    } catch (err) {
      setErrorMsg(err.message || "Failed to submit message. Please try again or check backend server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHero
        crumb="Contact"
        eyebrow="Get in touch"
        title="We'd love to hear from you"
        text="Reach out for admissions queries, campus visits, or general information."
      />

      <section className="section">
        <div className="container contact-grid">
          <div>
            <h2 style={{ fontSize: 22 }}>Contact information</h2>
            <div className="contact-info-item">
              <Icon name="pin" />
              <div>
                <strong>Address</strong>
                <p style={{ margin: 0, color: "var(--slate-soft)" }}>{college.addressLine}</p>
              </div>
            </div>
            <div className="contact-info-item">
              <Icon name="phone" />
              <div>
                <strong>Phone</strong>
                <p style={{ margin: 0, color: "var(--slate-soft)" }}>{college.phone} · {college.altPhone}</p>
              </div>
            </div>
            <div className="contact-info-item">
              <Icon name="mail" />
              <div>
                <strong>Email</strong>
                <p style={{ margin: 0, color: "var(--slate-soft)" }}>{college.email}</p>
              </div>
            </div>
            <div className="contact-info-item">
              <Icon name="clock" />
              <div>
                <strong>Office Hours</strong>
                <p style={{ margin: 0, color: "var(--slate-soft)" }}>Mon – Sat, 10:00 AM – 4:00 PM</p>
              </div>
            </div>

            <div className="map-block">
              Ashapur Village, Raniganj Tehsil, Pratapgarh District, Uttar Pradesh, India
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: 22 }}>Send a message</h2>
            {successMsg && (
              <div className="form-success" style={{ background: "#EAF4EA", color: "#2C5F2D", padding: "12px", borderRadius: "6px", marginBottom: "16px" }}>
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="form-error" style={{ background: "#FDE8E8", color: "#9B1C1C", padding: "12px", borderRadius: "6px", marginBottom: "16px" }}>
                {errorMsg}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="fullName">Full name</label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Your name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="subject">Subject</label>
                <select id="subject" name="subject" value={formData.subject} onChange={handleChange}>
                  <option value="Admission Enquiry">Admission Enquiry</option>
                  <option value="Fee Structure">Fee Structure</option>
                  <option value="Campus Visit">Campus Visit</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  placeholder="How can we help?"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>
              <button className="btn btn--primary" type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
