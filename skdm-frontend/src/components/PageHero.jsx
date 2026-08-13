export default function PageHero({ eyebrow, title, text, crumb }) {
  return (
    <section className="page-hero">
      <div className="container">
        {crumb && (
          <div className="breadcrumb">
            Home / <span>{crumb}</span>
          </div>
        )}
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {text && <p>{text}</p>}
      </div>
    </section>
  );
}
