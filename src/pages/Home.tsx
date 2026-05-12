// src/pages/Home.jsx
import { useEffect, useMemo, useState } from "react";
import Filters from "../components/Filters";
import JobList from "../components/JobList";
import Loader from "../components/Loader";
import Error from "../components/Error";
import { fetchJobs, filterJobs, DEMO_JOBS, normalizeType } from "../services/api";

const FLOATS = ["🔵", "⚙️", "🌊", "◎", "⚡", "💫"];

const FEATURES = [
  {
    icon: "🎯",
    title: "Precision Matching",
    text: "Our smart filters connect you to roles that fit your exact skills, location, and work-style preferences in seconds.",
  },
  {
    icon: "🌍",
    title: "Global Opportunities",
    text: "Browse thousands of remote and local positions from leading companies across Africa, Europe, and beyond.",
  },
  {
    icon: "⚡",
    title: "Apply Instantly",
    text: "One-click applications with your saved profile. No re-entering details — just discover, click, and get hired.",
  },
];

function badgeLabel(type = "") {
  const normalizedType = normalizeType(type);

  const labels = {
    "full-time": "Full-time",
    contract: "Contract",
    "part-time": "Part-time",
    freelance: "Freelance",
    remote: "Remote",
  };

  return labels[normalizedType] || type || "Remote";
}

function Home({
  searchTerm = "",
  setSearchTerm,
  savedIds = new Set(),
  onSave,
  onSelectJob,
  onNavigate,
  activeCategory = "All",
  setActiveCategory,
}) {
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState("");

  const loadJobs = async () => {
    setLoading(true);
    setError(null);

    try {
      const jobs = await fetchJobs({ limit: 40 });
      setAllJobs(Array.isArray(jobs) && jobs.length > 0 ? jobs : DEMO_JOBS);
    } catch (err) {
      setError(err?.message || "Failed to load jobs.");
      setAllJobs(DEMO_JOBS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const jobs = await fetchJobs({ limit: 40 });

        if (isMounted) {
          setAllJobs(Array.isArray(jobs) && jobs.length > 0 ? jobs : DEMO_JOBS);
        }
      } catch (err) {
        if (!isMounted) return;

        setError(err?.message || "Failed to load jobs.");
        setAllJobs(DEMO_JOBS);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredJobs = useMemo(() => {
    return filterJobs(allJobs, {
      searchTerm,
      category: activeCategory,
      filterType,
    });
  }, [allJobs, searchTerm, activeCategory, filterType]);

  const stats = useMemo(() => {
    const companies = new Set(
      allJobs.map((job) => job?.company).filter(Boolean)
    );

    return {
      total: allJobs.length,
      companies: companies.size,
      remote: allJobs.filter((job) =>
        String(job?.location || "").toLowerCase().includes("remote")
      ).length,
      countries: 40,
    };
  }, [allJobs]);

  const elevatorJobs = useMemo(() => {
    const sourceJobs =
      allJobs.length > 0 ? allJobs.slice(0, 8) : DEMO_JOBS.slice(0, 8);

    return [...sourceJobs, ...sourceJobs];
  }, [allJobs]);

  const scrollToJobs = () => {
    const jobsAnchor = document.getElementById("jobs-anchor");

    if (jobsAnchor) {
      jobsAnchor.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleSearchChange = (event) => {
    if (typeof setSearchTerm === "function") {
      setSearchTerm(event.target.value);
    }
  };

  const handleSelectJob = (job) => {
    if (!job) return;
    onSelectJob?.(job);
  };

  return (
    <div className="page page--home">
      <section className="hero">
        <div className="hero__bg">
          <div className="hero__radial" />
          <div className="hero__radial2" />
          <div className="hero__grid" />
        </div>

        <div className="hero__arc hero__arc--1" />
        <div className="hero__arc hero__arc--2" />
        <div className="hero__arc hero__arc--3" />

        {FLOATS.map((emoji, index) => (
          <div
            key={`${emoji}-${index}`}
            className={`hero__float hero__float--${index + 1}`}
          >
            {emoji}
          </div>
        ))}

        <div className="container">
          <div className="hero__content">
            <div className="hero__pill">
              <span className="hero__pill-new">NEW</span>
              <span>The best job seekers</span>
              <span className="hero__pill-sep" />

              <button
                type="button"
                className="hero__pill-link"
                onClick={scrollToJobs}
              >
                Explore →
              </button>
            </div>

            <h1 className="hero__title">We know the way to success.</h1>

            <h1 className="hero__title hero__title--dim">
              Find and become a professional.
            </h1>

            <p className="hero__sub">
              A successful business needs a qualified team of people.
            </p>

            <div className="hero__search">
              <span className="hero__search-icon" aria-hidden="true">
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>

              <input
                type="text"
                placeholder="Job title"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    scrollToJobs();
                  }
                }}
              />

              <button
                type="button"
                className="btn btn--white"
                onClick={scrollToJobs}
              >
                Find Jobs →
              </button>
            </div>
          </div>
        </div>
      </section>

      {!loading && (
        <section className="stats-bar">
          <div className="container">
            <div className="stats-bar__inner">
              <div>
                <div className="stats-bar__num">{stats.total}+</div>
                <div className="stats-bar__label">Open Positions</div>
              </div>

              <div>
                <div className="stats-bar__num">{stats.companies}+</div>
                <div className="stats-bar__label">Companies Hiring</div>
              </div>

              <div>
                <div className="stats-bar__num">{stats.remote}</div>
                <div className="stats-bar__label">Remote Jobs</div>
              </div>

              <div>
                <div className="stats-bar__num">{stats.countries}+</div>
                <div className="stats-bar__label">Countries</div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="about">
        <div className="container">
          <div className="about__grid">
            <div>
              <p className="about__eyebrow">ABOUT HIREFLOW</p>

              <h2 className="about__title">One step to your</h2>

              <h2 className="about__title about__title--dim">
                future starts here
              </h2>

              <p className="about__body">
                Receive a customized salary approximation based on your profile.
                Access reviews for more than 600,000 companies worldwide and land
                your next role faster than ever.
              </p>

              <button
                type="button"
                className="btn btn--outline"
                onClick={() => onNavigate?.("about")}
              >
                Learn More
              </button>
            </div>

            <div className="elevator-panel">
              <div className="elevator-panel__header">
                <span className="elevator-panel__label">Jobs</span>

                <button
                  type="button"
                  className="elevator-panel__link"
                  onClick={scrollToJobs}
                >
                  All Jobs →
                </button>
              </div>

              <div className="elevator-panel__track">
                <div className="elevator-panel__belt">
                  {elevatorJobs.map((job, index) => {
                    const jobKey = job?.id ?? `${job?.title || "job"}-${index}`;

                    return (
                      <div
                        key={`${jobKey}-${index}`}
                        className="elevator-row"
                        role="button"
                        tabIndex={0}
                        onClick={() => handleSelectJob(job)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            handleSelectJob(job);
                          }
                        }}
                      >
                        <div>
                          <p className="elevator-row__title">
                            {job?.title || "Untitled Role"}
                          </p>

                          <div className="elevator-row__meta">
                            <span className="elevator-row__chip">
                              <svg
                                width="11"
                                height="11"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                aria-hidden="true"
                              >
                                <circle cx="12" cy="12" r="10" />
                                <line x1="2" y1="12" x2="22" y2="12" />
                                <path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10A15 15 0 0 1 12 2z" />
                              </svg>

                              {job?.location || "Remote"}
                            </span>

                            <span className="elevator-row__chip">
                              <svg
                                width="11"
                                height="11"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                aria-hidden="true"
                              >
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                              </svg>

                              {badgeLabel(job?.jobType)}
                            </span>
                          </div>
                        </div>

                        <div className="elevator-row__right">
                          {job?.salary && (
                            <span className="elevator-row__salary">
                              {job.salary}
                            </span>
                          )}

                          <button
                            type="button"
                            className="elevator-row__apply"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleSelectJob(job);
                            }}
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="why">
        <div className="container">
          <p className="why__eyebrow">WHY HIREFLOW</p>

          <h2 className="why__title">New way to get a job</h2>

          <p className="why__sub">
            Upon gaining entry to the HireFlow platform, your initial task involves
            discovering the perfect role and applying in seconds.
          </p>

          <div className="why__features">
            {FEATURES.map((feature) => (
              <div className="why__feature" key={feature.title}>
                <div className="why__feature-icon">{feature.icon}</div>
                <h3 className="why__feature-title">{feature.title}</h3>
                <p className="why__feature-text">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div id="jobs-anchor" />

      <section className="jobs-section">
        <div className="container">
          <div className="jobs-section__header">
            <div>
              <h2 className="jobs-section__title">Available Jobs</h2>

              {!loading && (
                <p className="jobs-section__count">
                  {filteredJobs.length} position
                  {filteredJobs.length !== 1 ? "s" : ""} found
                </p>
              )}
            </div>
          </div>

          <Filters
            filterType={filterType}
            setFilterType={setFilterType}
            activeCategory={activeCategory}
            setActiveCategory={
              typeof setActiveCategory === "function"
                ? setActiveCategory
                : () => {}
            }
          />

          {loading && <Loader />}

          {!loading && error && (
            <div className="jobs-grid">
              <Error message={error} onRetry={loadJobs} />
            </div>
          )}

          {!loading && !error && (
            <JobList
              jobs={filteredJobs}
              savedIds={savedIds}
              onSave={onSave}
              onSelect={onSelectJob}
            />
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;