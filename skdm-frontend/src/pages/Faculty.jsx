import { useEffect, useState } from "react";
import PageHero from "../components/PageHero";
import { facultyApi, getFileUrl } from "../services/api";

export default function Faculty() {
  const [facultyList, setFacultyList] = useState([]);
  const [dept, setDept] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const res = await facultyApi.getAll();
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        const mapped = res.data.map((f) => ({
          name: f.name,
          role: f.designation || f.role || "Faculty",
          dept: f.departmentName || f.dept || "General",
          initials: f.initials || f.name.split(" ").map((n) => n[0]).join("").substring(0, 3).toUpperCase(),
          photoUrl: f.photoUrl || null,
        }));
        setFacultyList(mapped);
      } else {
        setFacultyList(staticFaculty);
      }
    } catch (err) {
      console.warn("Failed to fetch dynamic faculty, using default data:", err);
      setFacultyList(staticFaculty);
    } finally {
      setLoading(false);
    }
  };

  // Derive department options
  const dynamicDepts = Array.from(new Set(facultyList.map((f) => f.dept).filter(Boolean)));
  const allDepts = ["All", ...Array.from(new Set([...staticDepartments.filter((d) => d !== "All"), ...dynamicDepts]))];

  const list = dept === "All" ? facultyList : facultyList.filter((f) => f.dept === dept);

  return (
    <>
      <PageHero
        crumb="Faculty"
        eyebrow="Our teachers"
        title="Meet the faculty"
        text="A dedicated teaching staff across Arts, Science, Commerce, Computer Science and Education."
      />

      <section className="section">
        <div className="container">
          <div className="filter-row">
            {allDepts.map((d) => (
              <button
                key={d}
                className={`filter-chip ${dept === d ? "active" : ""}`}
                onClick={() => setDept(d)}
              >
                {d}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--slate-soft)" }}>
              Loading faculty members...
            </div>
          ) : (
            <div className="grid grid--4">
              {list.map((f, idx) => (
                <div className="card faculty-card" key={f.name + idx}>
                  {f.photoUrl ? (
                    <img
                      src={getFileUrl(f.photoUrl)}
                      alt={f.name}
                      className="faculty-avatar"
                      style={{ objectFit: "cover" }}
                      onError={(e) => {
                        e.target.style.display = "none";
                        if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div className="faculty-avatar" style={{ display: f.photoUrl ? "none" : "flex" }}>
                    {f.initials}
                  </div>
                  <h3>{f.name}</h3>
                  <p>{f.role}</p>
                  <span className="faculty-dept">{f.dept}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
