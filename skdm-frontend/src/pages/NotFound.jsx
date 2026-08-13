import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="section text-center">
      <div className="container">
        <span className="eyebrow">404</span>
        <h1>Page not found</h1>
        <p style={{ color: "var(--slate-soft)" }}>The page you're looking for doesn't exist.</p>
        <Link className="btn btn--primary" to="/">Back to Home</Link>
      </div>
    </section>
  );
}
