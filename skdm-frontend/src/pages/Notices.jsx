import { useEffect, useState } from "react";
import PageHero from "../components/PageHero";
import { noticesApi, getFileUrl } from "../services/api";

export default function Notices() {
  const [noticeList, setNoticeList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await noticesApi.getAll();
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        const mapped = res.data.map((n) => ({
          title: n.title,
          tag: n.tag || "General",
          date: n.noticeDate || n.createdAt || new Date().toISOString(),
          link: n.attachmentUrl || null,
        }));
        setNoticeList(mapped);
      } else {
        setNoticeList(staticNotices);
      }
    } catch (err) {
      console.warn("Failed to fetch dynamic notices, using default data:", err);
      setNoticeList(staticNotices);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHero
        crumb="Notices"
        eyebrow="Notice board"
        title="Circulars & announcements"
        text="Official college announcements, examination schedules, and event circulars."
      />

      <section className="section">
        <div className="container">
          <div className="card">
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--slate-soft)" }}>
                Loading notices...
              </div>
            ) : (
              <div className="notice-list">
                {noticeList.map((n, idx) => (
                  <div className="notice-row" key={n.title + idx}>
                    <span className="notice-date">
                      {new Date(n.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                    <span className="notice-tag">{n.tag}</span>
                    <span>
                      <strong style={{ display: "block" }}>{n.title}</strong>
                      {n.link && (
                        <div style={{ marginTop: 8 }}>
                          <a
                            href={getFileUrl(n.link)}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "6px 14px",
                              borderRadius: 6,
                              background: "#7A1F2B",
                              color: "#ffffff",
                              fontSize: 12,
                              fontWeight: 700,
                              textDecoration: "none",
                              boxShadow: "0 2px 5px rgba(0,0,0,0.15)"
                            }}
                          >
                            <span>📎 View / Download Attachment</span>
                          </a>
                        </div>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
