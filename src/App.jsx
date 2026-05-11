// src/App.jsx
import { useState } from "react";
import Navbar     from "./components/Navbar";
import Home       from "./pages/Home";
import JobDetails from "./pages/JobDetails";
import "./App.css";

function App() {
  const [selectedJob, setSelectedJob] = useState(null);
  const [savedIds,    setSavedIds]    = useState(new Set());
  const [searchTerm,  setSearchTerm]  = useState("");

  const handleSave = (id) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const scrollToJobs = () => {
    setSelectedJob(null);
    setTimeout(() => {
      document.getElementById("jobs-section")?.scrollIntoView({ behavior:"smooth" });
    }, 50);
  };

  return (
    <div className="app">
      <Navbar
        onHomeClick={() => setSelectedJob(null)}
        onJobsClick={scrollToJobs}
        savedCount={savedIds.size}
      />

      <div className="app__body">
        {selectedJob ? (
          <JobDetails
            job={selectedJob}
            onBack={() => setSelectedJob(null)}
            isSaved={savedIds.has(selectedJob.id)}
            onSave={handleSave}
          />
        ) : (
          <Home
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            savedIds={savedIds}
            onSave={handleSave}
            onSelectJob={setSelectedJob}
          />
        )}
      </div>

      <footer className="footer">
        <div className="container">
          © 2025 <strong>Job Board</strong> · Find and become a professional.
        </div>
      </footer>
    </div>
  );
}

export default App;