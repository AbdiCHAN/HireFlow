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

  return (
    <div className="app">
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        savedCount={savedIds.size}
        onHomeClick={() => setSelectedJob(null)}
        onSavedClick={() => setSelectedJob(null)}
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
            savedIds={savedIds}
            onSave={handleSave}
            onSelectJob={setSelectedJob}
          />
        )}
      </div>

      <footer className="footer">
        <div className="container">
          Built with <strong>HireFlow</strong> · Connecting developers with opportunities across Africa &amp; beyond
        </div>
      </footer>
    </div>
  );
}

export default App;