import { useEffect, useState } from "react";
import PageHero from "../components/PageHero";
import { courses as staticCourses } from "../data/collegeData";
import { Link } from "react-router-dom";
import { coursesApi } from "../services/api";

export default function Courses() {
  const [courseList, setCourseList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await coursesApi.getAll();
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        const mapped = res.data.map((c) => ({
          code: c.code || c.shortName,
          name: c.name,
          duration: c.durationYears ? `${c.durationYears} Years` : c.duration || "N/A",
          seats: c.totalSeats ?? c.seats ?? "N/A",
          eligibility: c.eligibility || "Check with admissions office",
          subjects: Array.isArray(c.subjects) ? c.subjects : [],
        }));
        setCourseList(mapped);
      } else {
        setCourseList(staticCourses);
      }
    } catch (err) {
      console.warn("Failed to fetch dynamic courses, using default data:", err);
      setCourseList(staticCourses);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHero
        crumb="Courses"
        eyebrow="Programmes"
        title="Undergraduate & postgraduate degree courses"
        text="Every programme is affiliated to Dr. Ram Manohar Lohia Avadh University. Seat counts and subjects below are indicative — confirm current intake with the admissions office."
      />

      <section className="section">
        <div className="container">
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--slate-soft)" }}>
              Loading courses...
            </div>
          ) : (
            <div className="grid grid--3">
              {courseList.map((c, idx) => (
                <div className="card course-card" key={c.code || idx}>
                  <span className="code">{c.code}</span>
                  <h3>{c.name}</h3>
                  <div className="course-meta">
                    <span>⏱ {c.duration}</span>
                    <span>🎓 {c.seats} seats</span>
                  </div>
                  <p style={{ color: "var(--slate-soft)", fontSize: 14 }}>
                    Eligibility: {c.eligibility}
                  </p>
                  {c.subjects && c.subjects.length > 0 && (
                    <div className="course-tags">
                      {c.subjects.map((s) => <span key={s}>{s}</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="cta-band mt-lg">
            <div>
              <h2>Not sure which programme fits you?</h2>
              <p>Our admissions counsellors can help you choose the right course.</p>
            </div>
            <Link className="btn btn--gold" to="/contact">Talk to Admissions</Link>
          </div>
        </div>
      </section>
    </>
  );
}
