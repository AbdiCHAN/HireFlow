// src/pages/Home.jsx
import { useState, useEffect, useMemo } from "react";
import Filters  from "../components/Filters";
import JobList  from "../components/JobList";
import Loader   from "../components/Loader";
import Error    from "../components/Error";
import { fetchJobs, filterJobs, DEMO_JOBS } from "../services/api";

/* ── Top companies shown in right sidebar ── */
const TOP_COMPANIES = [
  { name:"Safaricom",   jobs:12, color:"#D1FAE5", text:"#065F46" },
  { name:"Andela",      jobs:8,  color:"#DBEAFE", text:"#1D4ED8" },
  { name:"M-Pesa",      jobs:6,  color:"#FEF3C7", text:"#92400E" },
  { name:"Copia Global",jobs:4,  color:"#EDE9FE", text:"#5B21B6" },
  { name:"Ajua",        jobs:3,  color:"#FCE7F3", text:"#9D174D" },
];

function Home({ searchTerm, savedIds, onSave, onSelectJob }) {
  const [allJobs,        setAllJobs]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [filterType,     setFilterType]     = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const jobs = await fetchJobs({ limit: 40 });
      setAllJobs(jobs);
    } catch (err) {
      setError(err.message);
      setAllJobs(DEMO_JOBS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadJobs(); }, []);

  const filteredJobs = useMemo(
    () => filterJobs(allJobs, { searchTerm, category: activeCategory, filterType }),
    [allJobs, searchTerm, activeCategory, filterType]
  );

  const stats = useMemo(() => ({
    total:     allJobs.length,
    companies: new Set(allJobs.map(j => j.company)).size,
    remote:    allJobs.filter(j => j.location?.toLowerCase().includes("remote")).length,
  }), [allJobs]);

  return (
    <>
      {/* ══ HERO ══════════════════════════════════════ */}
      <section className="hero">
        <div className="container">
          <div className="hero__content">
            <span className="hero__tag">
              <span className="hero__tag-dot" />
              Live opportunities across Africa
            </span>

            <h1 className="hero__title">
              Your next <em>developer</em><br />role starts here.
            </h1>

            <p className="hero__sub">
              Browse curated tech jobs in Nairobi and beyond.<br />
              No noise — just the right opportunity.
            </p>

            {/* Hero search box */}
            <div className="hero__search-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A09B94" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Job title, company, or skill…"
                defaultValue={searchTerm}
                onKeyDown={(e) => {
                  if (e.key === "Enter")
                    document.getElementById("jobs-anchor")?.scrollIntoView({ behavior:"smooth" });
                }}
              />
              <button
                className="hero__search-btn"
                onClick={() => document.getElementById("jobs-anchor")?.scrollIntoView({ behavior:"smooth" })}
              >
                Search Jobs
              </button>
            </div>

            {/* Stats */}
            {!loading && (
              <div className="hero__stats">
                <div className="hero__stat">
                  <div className="hero__stat-num">{stats.total}+</div>
                  <div className="hero__stat-label">Open Roles</div>
                </div>
                <div className="hero__stat">
                  <div className="hero__stat-num">{stats.companies}+</div>
                  <div className="hero__stat-label">Companies</div>
                </div>
                <div className="hero__stat">
                  <div className="hero__stat-num">{stats.remote}</div>
                  <div className="hero__stat-label">Remote</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══ 3-COLUMN LAYOUT ══════════════════════════ */}
      <div id="jobs-anchor" />
      <div className="container">
        <div className="page-layout">

          {/* LEFT sidebar */}
          <aside className="page-layout__left">
            <div className="sidebar-card">
              <div className="sidebar-card__banner" />
              <div className="sidebar-card__profile">
                <div className="sidebar-card__avatar">A</div>
                <p className="sidebar-card__name">Athanas Dev</p>
                <p className="sidebar-card__role">Full-stack Developer</p>
                <div className="sidebar-card__divider" />
                <div className="sidebar-card__stat-row">
                  <span className="sidebar-card__stat-label">Profile views</span>
                  <span className="sidebar-card__stat-val">142</span>
                </div>
                <div className="sidebar-card__stat-row">
                  <span className="sidebar-card__stat-label">Applications</span>
                  <span className="sidebar-card__stat-val">7</span>
                </div>
                <div className="sidebar-card__stat-row">
                  <span className="sidebar-card__stat-label">Saved jobs</span>
                  <span className="sidebar-card__stat-val">{savedIds?.size || 0}</span>
                </div>
              </div>
            </div>

            {/* Quick nav */}
            <ul className="sidebar-menu" style={{ marginTop:12, background:"var(--surface)", borderRadius:"var(--r-lg)", border:"1px solid var(--border)", boxShadow:"var(--shadow-sm)" }}>
              {[
                ["🏠", "Home"],
                ["💼", "My Jobs"],
                ["🔔", "Job Alerts"],
                ["📄", "My Resume"],
                ["⚙️",  "Settings"],
              ].map(([icon, label]) => (
                <li key={label} className={label === "Home" ? "active" : ""}>
                  <span>{icon}</span> {label}
                </li>
              ))}
            </ul>
          </aside>

          {/* MAIN: filter bar + job list */}
          <main className="page-layout__main">
            <Filters
              filterType={filterType}
              setFilterType={setFilterType}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              totalCount={filteredJobs.length}
            />

            {loading  && <Loader />}
            {!loading && error && <Error message={error} onRetry={loadJobs} />}
            {!loading && (
              <JobList
                jobs={filteredJobs}
                savedIds={savedIds}
                onSave={onSave}
                onSelect={onSelectJob}
              />
            )}
          </main>

          {/* RIGHT sidebar */}
          <aside className="page-layout__right">
            {/* Insight promo card */}
            <div className="insight-card">
              <p className="insight-card__label">Pro Tip</p>
              <p className="insight-card__title">Get noticed faster</p>
              <p className="insight-card__sub">Complete your profile to appear in recruiter searches and get matched to relevant roles.</p>
              <button className="insight-card__btn">Complete Profile</button>
            </div>

            {/* Top companies */}
            <div className="promo-card">
              <p className="promo-card__title">Top Hiring Companies</p>
              {TOP_COMPANIES.map((c) => (
                <div className="company-item" key={c.name}>
                  <div
                    className="company-item__logo"
                    style={{ background: c.color, color: c.text }}
                  >
                    {c.name[0]}
                  </div>
                  <div>
                    <p className="company-item__name">{c.name}</p>
                    <p className="company-item__jobs">{c.jobs} open roles</p>
                  </div>
                  <button className="company-item__follow">Follow</button>
                </div>
              ))}
            </div>
          </aside>

        </div>
      </div>
    </>
  );
}

export default Home;