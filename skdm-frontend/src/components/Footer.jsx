import { Link } from "react-router-dom";
import { college, navLinks } from "../data/collegeData";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <span className="brand-mark">SKM</span>
              <span className="name">{college.name}</span>
            </div>
            <p style={{ fontSize: 14, maxWidth: "38ch" }}>
              A degree college of the {college.trust}, serving the students of{" "}
              {college.district} district since {college.founded}.
            </p>
          </div>

          <div>
            <h4>Explore</h4>
            <ul>
              {navLinks.slice(0, 5).map((l) => (
                <li key={l.to}><Link to={l.to}>{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Students</h4>
            <ul>
              {navLinks.slice(5).map((l) => (
                <li key={l.to}><Link to={l.to}>{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Reach Us</h4>
            <ul>
              <li>{college.addressLine}</li>
              <li>{college.phone}</li>
              <li>{college.email}</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} {college.name}. All rights reserved.</span>
          <span>Managed by {college.trust}</span>
        </div>
      </div>
    </footer>
  );
}
