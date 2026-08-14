import { useEffect, useState } from "react";
import PageHero from "../components/PageHero";
import { galleryItems as staticGalleryItems } from "../data/collegeData";
import { galleryApi, getFileUrl } from "../services/api";

const huePairs = [
  ["#7A1F2B", "#1F2A44"],
  ["#1F2A44", "#E8A33D"],
  ["#93262F", "#2C3A5E"],
  ["#E8A33D", "#7A1F2B"],
];

export default function Gallery() {
  const [galleryList, setGalleryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState("All");
  const [lightboxItem, setLightboxItem] = useState(null);

  useEffect(() => {
    fetchGallery();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setLightboxItem(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const res = await galleryApi.getAll();
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        const mapped = res.data.map((item) => ({
          id: item.id,
          caption: item.caption,
          tag: item.tag || "Campus",
          imageUrl: item.imageUrl || null,
        }));
        setGalleryList(mapped);
      } else {
        setGalleryList(staticGalleryItems);
      }
    } catch (err) {
      console.warn("Failed to load dynamic gallery items, using fallback data:", err);
      setGalleryList(staticGalleryItems);
    } finally {
      setLoading(false);
    }
  };

  // Derive filter tags
  const dynamicTags = Array.from(new Set(galleryList.map((g) => g.tag).filter(Boolean)));
  const allTags = ["All", ...Array.from(new Set(dynamicTags))];

  const displayedItems = activeTag === "All"
    ? galleryList
    : galleryList.filter((g) => g.tag === activeTag);

  return (
    <>
      <PageHero
        crumb="Gallery"
        eyebrow="Campus moments"
        title="Life at SKM"
        text="A look at campus events, cultural meets, and everyday college life."
      />

      <section className="section">
        <div className="container">
          {/* Category Filter Chips */}
          <div className="filter-row" style={{ marginBottom: 30, display: "flex", gap: 10, flexWrap: "wrap" }}>
            {allTags.map((tag) => (
              <button
                key={tag}
                className={`filter-chip ${activeTag === tag ? "active" : ""}`}
                onClick={() => setActiveTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--slate-soft)" }}>
              Loading campus gallery...
            </div>
          ) : (
            <div className="grid grid--4">
              {displayedItems.map((g, i) => {
                const [a, b] = huePairs[i % huePairs.length];
                return (
                  <div
                    className="gallery-item"
                    key={g.id || g.caption + i}
                    onClick={() => setLightboxItem(g)}
                    style={{ "--hue-a": a, "--hue-b": b, cursor: "pointer" }}
                    title="Click to view photograph"
                  >
                    {g.imageUrl && (
                      <img
                        src={getFileUrl(g.imageUrl)}
                        alt={g.caption}
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          zIndex: 1,
                          transition: "transform 0.35s ease"
                        }}
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    )}
                    <span className="tag" style={{ zIndex: 2 }}>{g.tag}</span>
                    <span className="cap" style={{ zIndex: 2 }}>{g.caption}</span>
                  </div>
                );
              })}
            </div>
          )}

          {displayedItems.length === 0 && !loading && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--slate-soft)" }}>
              No gallery items found for "{activeTag}".
            </div>
          )}
        </div>
      </section>

      {/* LIGHTBOX MODAL WITH CLOSE BUTTON / SIGN */}
      {lightboxItem && (
        <div
          className="gallery-lightbox-overlay"
          onClick={() => setLightboxItem(null)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.92)",
            backdropFilter: "blur(8px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            className="gallery-lightbox-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "1000px",
              width: "92vw",
              maxHeight: "90vh",
              background: "#0f172a",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
              display: "flex",
              flexDirection: "column",
              border: "1px solid rgba(255, 255, 255, 0.12)"
            }}
          >
            {/* Top Close Icon Button */}
            <button
              onClick={() => setLightboxItem(null)}
              title="Close (Esc)"
              aria-label="Close modal"
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                zIndex: 20,
                background: "rgba(0, 0, 0, 0.8)",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "50%",
                width: 42,
                height: 42,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 4px 10px rgba(0,0,0,0.4)"
              }}
            >
              ✕
            </button>

            {/* Image / Gradient Preview Area */}
            <div
              style={{
                flex: 1,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                maxHeight: "72vh",
                width: "100%",
                background: "#020617"
              }}
            >
              {lightboxItem.imageUrl ? (
                <img
                  src={getFileUrl(lightboxItem.imageUrl)}
                  alt={lightboxItem.caption || "Gallery Photograph"}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "72vh",
                    objectFit: "contain",
                    display: "block"
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                    if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                style={{
                  display: lightboxItem.imageUrl ? "none" : "flex",
                  width: "100%",
                  height: "400px",
                  background: "linear-gradient(135deg, #7A1F2B, #1F2A44)",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 24,
                  fontWeight: 700,
                  padding: 20,
                  textAlign: "center"
                }}
              >
                {lightboxItem.caption}
              </div>
            </div>

            {/* Footer Bar with Title, Category, and Explicit Close Sign Button */}
            <div
              style={{
                padding: "16px 24px",
                width: "100%",
                background: "#0f172a",
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap"
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#e8a33d",
                    background: "rgba(232, 163, 61, 0.15)",
                    padding: "4px 10px",
                    borderRadius: 999,
                    display: "inline-block"
                  }}
                >
                  {lightboxItem.tag || "Campus"}
                </span>
                <h3 style={{ color: "#f8fafc", fontSize: 18, marginTop: 6, marginBottom: 0, fontWeight: 600 }}>
                  {lightboxItem.caption}
                </h3>
              </div>
              <button
                onClick={() => setLightboxItem(null)}
                style={{
                  background: "#7A1F2B",
                  color: "#ffffff",
                  border: "1px solid #93262F",
                  padding: "9px 18px",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
                }}
              >
                <span>Close</span>
                <span style={{ fontSize: 16, fontWeight: 900 }}>✕</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
