import { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import JobDetails from "./pages/JobDetails";
import {
  AboutPage,
  CandidatesPage,
  CategoriesPage,
  CVPostPage,
  NewsPage,
  PostJobPage,
} from "./pages/InfoPages";
import "./App.css";

const VALID_PAGES = new Set([
  "home",
  "jobs",
  "about",
  "categories",
  "candidates",
  "news",
  "post-job",
  "cv-post",
]);

const SAVED_JOBS_KEY = "hireflow_saved_jobs";

function getSafePage(page) {
  return VALID_PAGES.has(page) ? page : "home";
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
  );
}

function App() {
  const [selectedJob, setSelectedJob] = useState(null);
  const [savedIds, setSavedIds] = useState(() => {
    try {
      const stored = localStorage.getItem(SAVED_JOBS_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      return new Set(Array.isArray(parsed) ? parsed : []);
    } catch {
      return new Set();
    }
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [activePage, setActivePage] = useState("home");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify([...savedIds]));
    } catch {
      // Ignore storage errors so the app does not crash.
    }
  }, [savedIds]);

  const scrollToTop = useCallback(() => {
    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    });
  }, []);

  const scrollToJobs = useCallback(() => {
    setSelectedJob(null);
    setActivePage("jobs");

    requestAnimationFrame(() => {
      const jobsSection = document.getElementById("jobs-anchor");

      if (jobsSection) {
        jobsSection.scrollIntoView({
          behavior: prefersReducedMotion() ? "auto" : "smooth",
          block: "start",
        });
      } else {
        window.scrollTo({
          top: 0,
          behavior: prefersReducedMotion() ? "auto" : "smooth",
        });
      }
    });
  }, []);

  const handleSave = useCallback((id) => {
    if (id === undefined || id === null) return;

    setSavedIds((previousIds) => {
      const nextIds = new Set(previousIds);

      if (nextIds.has(id)) {
        nextIds.delete(id);
      } else {
        nextIds.add(id);
      }

      return nextIds;
    });
  }, []);

  const handleNavigate = useCallback(
    (page) => {
      const safePage = getSafePage(page);

      setSelectedJob(null);

      if (safePage === "jobs") {
        scrollToJobs();
        return;
      }

      setActivePage(safePage);

      if (safePage === "home") {
        setActiveCategory("All");
      }

      scrollToTop();
    },
    [scrollToJobs, scrollToTop]
  );

  const handleSelectJob = useCallback(
    (job) => {
      if (!job || job.id === undefined || job.id === null) return;

      setActivePage("jobs");
      setSelectedJob(job);
      scrollToTop();
    },
    [scrollToTop]
  );

  const handleBackToJobs = useCallback(() => {
    setSelectedJob(null);
    scrollToJobs();
  }, [scrollToJobs]);

  const handleCategorySelect = useCallback(
    (category) => {
      setSelectedJob(null);
      setActiveCategory(category || "All");
      scrollToJobs();
    },
    [scrollToJobs]
  );

  const currentNavbarPage = selectedJob ? "jobs" : activePage;

  const renderedPage = useMemo(() => {
    if (selectedJob) {
      return (
        <JobDetails
          job={selectedJob}
          onBack={handleBackToJobs}
          isSaved={savedIds.has(selectedJob.id)}
          onSave={handleSave}
        />
      );
    }

    switch (activePage) {
      case "about":
        return <AboutPage onNavigate={handleNavigate} />;

      case "categories":
        return (
          <CategoriesPage
            onNavigate={handleNavigate}
            onCategorySelect={handleCategorySelect}
          />
        );

      case "candidates":
        return <CandidatesPage onNavigate={handleNavigate} />;

      case "news":
        return <NewsPage onNavigate={handleNavigate} />;

      case "post-job":
        return <PostJobPage onNavigate={handleNavigate} />;

      case "cv-post":
        return <CVPostPage onNavigate={handleNavigate} />;

      case "home":
      case "jobs":
      default:
        return (
          <Home
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            savedIds={savedIds}
            onSave={handleSave}
            onSelectJob={handleSelectJob}
            onNavigate={handleNavigate}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />
        );
    }
  }, [
    activeCategory,
    activePage,
    handleBackToJobs,
    handleCategorySelect,
    handleNavigate,
    handleSave,
    handleSelectJob,
    savedIds,
    searchTerm,
    selectedJob,
  ]);

  return (
    <div className="app app-shell">
      <Navbar
        activePage={currentNavbarPage}
        onNavigate={handleNavigate}
        savedCount={savedIds.size}
      />

      <main className="main-content app__body">{renderedPage}</main>

      <footer className="footer">
        <div className="container">
          © {new Date().getFullYear()} <strong>HireFlow</strong> · Find and
          become a professional.
        </div>
      </footer>
    </div>
  );
}

export default App;