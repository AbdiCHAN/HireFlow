import { useCallback, useEffect, useMemo, useState } from "react";

import Error from "../components/Error";
import Filters from "../components/Filters";
import JobList from "../components/JobList";
import Loader from "../components/Loader";
import SearchBar from "../components/SearchBar";
import { applyToJob, fetchJobs, filterJobs, openApplyUrl } from "../services/api";
import { useAuth } from "../context/AuthContext";

function initials(name = "HireFlow") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function uniqueCompanies(jobs) {
  const seen = new Map();

  jobs.forEach((job) => {
    if (!job.company || seen.has(job.company)) return;

    seen.set(job.company, {
      name: job.company,
      location: job.location || "Remote hiring",
      initials: initials(job.company),
    });
  });

  return [...seen.values()].slice(0, 5);
}

function Home({
  searchTerm,
  setSearchTerm,
  savedIds,
  onSave,
  onSelectJob,
  onNavigate,
  activeCategory,
  setActiveCategory,
}) {
  const { user, isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  const [notice, setNotice] = useState("");

  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchJobs({ searchTerm, category: activeCategory, limit: 36 });
      setJobs(data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchTerm]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const filteredJobs = useMemo(
    () =>
      filterJobs(jobs, {
        searchTerm,
        category: activeCategory,
        filterType: selectedType,
      }),
    [activeCategory, jobs, searchTerm, selectedType]
  );

  const remoteCount = filteredJobs.filter((job) =>
    String(job.location || "").toLowerCase().includes("remote")
  ).length;

  const companies = uniqueCompanies(filteredJobs);
  const featuredJobs = filteredJobs.slice(0, 2);
  const syncTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleApply = async (job) => {
    if (!isAuthenticated) {
      setNotice("Sign in before applying so HireFlow can track your application.");
      onNavigate("login");
      return;
    }

    if (job.source !== "local") {
      openApplyUrl(job);
      return;
    }

    try {
      await applyToJob(job.id, `I am interested in ${job.title} at ${job.company}.`);
      setNotice("Application submitted and saved to your profile.");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Could not submit application.");
    }
  };

  return (
    <div className="feed-shell">
      <aside className="feed-side feed-side--left">
        <section className="profile-card">
          <div className="profile-card__banner" />
          <div className="profile-card__avatar">{user?.name ? initials(user.name) : "H"}</div>
          <h2>{isAuthenticated ? user.name : "Build your profile"}</h2>
          <p>
            {isAuthenticated
              ? `${user.role.replace("_", " ")} workspace ready.`
              : "Sign in to save jobs, upload your CV, and apply faster."}
          </p>
          <button type="button" onClick={() => onNavigate(isAuthenticated ? "profile" : "login")}>
            {isAuthenticated ? "View profile" : "Sign in"}
          </button>
        </section>

        <section className="side-card">
          <h3>Career snapshot</h3>
          <dl className="snapshot-list">
            <div>
              <dt>Saved jobs</dt>
              <dd>{savedIds.size}</dd>
            </div>
            <div>
              <dt>Open roles</dt>
              <dd>{filteredJobs.length}</dd>
            </div>
            <div>
              <dt>Hiring companies</dt>
              <dd>{companies.length}</dd>
            </div>
          </dl>
        </section>
      </aside>

      <main className="feed-main" id="jobs-anchor">
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSearch={loadJobs}
          userInitial={user?.name ? initials(user.name) : "H"}
        />

        <section className="hero-card">
          <div>
            <p className="eyebrow">Live hiring desk</p>
            <h1>Find roles, follow companies, and apply from one professional workspace.</h1>
            <p>
              HireFlow blends your saved local jobs with public listings, removes duplicates, and keeps applications tied to your signed-in account.
            </p>
          </div>
          <div className="hero-card__stats">
            <div>
              <strong>{filteredJobs.length}</strong>
              <span>roles</span>
            </div>
            <div>
              <strong>{remoteCount}</strong>
              <span>remote</span>
            </div>
            <div>
              <strong>{syncTime}</strong>
              <span>sync</span>
            </div>
          </div>
        </section>

        <Filters
          selectedCategory={activeCategory}
          setSelectedCategory={setActiveCategory}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
        />

        {notice && (
          <div className="notice-bar">
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice("")}>
              Dismiss
            </button>
          </div>
        )}

        {loading ? (
          <Loader />
        ) : error ? (
          <Error message={error} onRetry={loadJobs} />
        ) : (
          <>
            <section className="recommended-card">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Recommended for you</p>
                  <h2>Fast-moving jobs</h2>
                </div>
                <button type="button" onClick={() => setActiveCategory("All")}>
                  View all
                </button>
              </div>
              <div className="mini-job-list">
                {featuredJobs.map((job) => (
                  <button key={job.id} type="button" onClick={() => onSelectJob(job)}>
                    <span>{initials(job.company)}</span>
                    <strong>{job.title}</strong>
                    <small>{job.company}  -  {job.location}</small>
                  </button>
                ))}
              </div>
            </section>

            <JobList
              jobs={filteredJobs}
              savedIds={savedIds}
              onSave={onSave}
              onSelect={onSelectJob}
              onApply={handleApply}
            />
          </>
        )}
      </main>

      <aside className="feed-side feed-side--right">
        <section className="side-card hiring-pulse">
          <div className="side-card__title-row">
            <h3>Hiring pulse</h3>
            <span>Live</span>
          </div>
          <p>Remote engineering roles are moving fastest this week.</p>
          <p>Profiles with CV uploads get stronger application visibility.</p>
          <p>Employers are shortlisting candidates within 48 hours.</p>
        </section>

        <section className="side-card">
          <h3>Companies to follow</h3>
          <div className="company-list">
            {companies.map((company) => (
              <button key={company.name} type="button" onClick={() => setSearchTerm(company.name)}>
                <span>{company.initials}</span>
                <strong>{company.name}</strong>
                <small>{company.location} hiring</small>
              </button>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}

export default Home;
