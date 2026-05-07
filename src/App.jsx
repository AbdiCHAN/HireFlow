// src/App.jsx

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchJobs, filterJobs, getJobCategories } from "./services/api";

import Navbar from "./components/Navbar";
import Home from "./components/Home";
import SearchBar from "./components/SearchBar";
import Filters from "./components/Filters";
import Loader from "./components/Loader";
import Error from "./components/Error";
import JobList from "./components/JobList";

const App = () => {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const jobsData = await fetchJobs({
        limit: 40,
      });

      setJobs(jobsData);
    } catch (err) {
      setError(err.message || "Unable to load jobs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const categories = useMemo(() => {
    return getJobCategories(jobs);
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return filterJobs(jobs, {
      searchTerm,
      category: selectedCategory,
    });
  }, [jobs, searchTerm, selectedCategory]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSelectedCategory("All");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main>
        <Home
          totalJobs={jobs.length}
          visibleJobs={filteredJobs.length}
          isLoading={isLoading}
        />

        <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-md md:p-8">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
                  HireFlow Jobs
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
                  Discover remote hiring opportunities
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                  Browse live remote job opportunities powered by Remotive.
                  Search by title, company, category, location, or skill.
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-4 text-center">
                <p className="text-3xl font-bold text-cyan-300">
                  {filteredJobs.length}
                </p>
                <p className="text-sm text-slate-300">
                  Jobs showing
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_280px]">
              <SearchBar
                value={searchTerm}
                onChange={handleSearchChange}
                onClear={handleClearSearch}
                placeholder="Search jobs, companies, skills, or locations..."
              />

              <Filters
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
              />
            </div>

            <div className="mt-8">
              {isLoading && <Loader />}

              {!isLoading && error && (
                <Error
                  message={error}
                  onRetry={loadJobs}
                />
              )}

              {!isLoading && !error && filteredJobs.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-8 text-center">
                  <h2 className="text-xl font-semibold text-white">
                    No jobs found
                  </h2>

                  <p className="mt-2 text-slate-400">
                    Try searching with another keyword or choose a different category.
                  </p>

                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="mt-5 rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
                  >
                    Clear filters
                  </button>
                </div>
              )}

              {!isLoading && !error && filteredJobs.length > 0 && (
                <JobList jobs={filteredJobs} />
              )}
            </div>

            <p className="mt-8 text-center text-xs text-slate-500">
              Job data source: Remotive. Each job card should link back to the original Remotive job URL.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;