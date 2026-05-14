import React, { useEffect, useState } from "react";

import JobList from "../components/JobList";
import SearchBar from "../components/SearchBar";
import Filters from "../components/Filters";
import Loader from "../components/Loader";
import Error from "../components/Error";

import { fetchJobs } from "../services/api";

function Home() {
  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("");

  useEffect(() => {
    async function loadJobs() {
      try {
        setLoading(true);

        const data = await fetchJobs();

        setJobs(data);

        setError("");
      } catch (err) {
        setError("Failed to fetch jobs.");
      } finally {
        setLoading(false);
      }
    }

    loadJobs();
  }, []);

  // SEARCH + FILTER LOGIC
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      job.company
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "" ||
      job.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <Error message={error} />;
  }

  return (
    <div className="home-page">

      <div className="hero-section">
        <h1>Find Your Dream Tech Job</h1>

        <p>
          Search and apply for the best
          developer jobs worldwide.
        </p>
      </div>

      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <Filters
        selectedCategory={selectedCategory}
        setSelectedCategory={
          setSelectedCategory
        }
      />

      <JobList jobs={filteredJobs} />

    </div>
  );
}

export default Home;