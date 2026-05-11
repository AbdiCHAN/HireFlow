// src/components/JobList.jsx
import JobCard from "./JobCard";

function JobList({ jobs=[], savedIds, onSave, onSelect }) {
  if (jobs.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">🔍</div>
        <h3 className="empty-state__title">No jobs found</h3>
        <p className="empty-state__sub">Try adjusting your search or filter criteria.</p>
      </div>
    );
  }
  return (
    <div className="jobs-grid">
      {jobs.map((job, i) => (
        <JobCard
          key={job.id} job={job}
          isSaved={savedIds?.has(job.id)}
          onSave={onSave} onSelect={onSelect}
          animDelay={i * 0.05}
        />
      ))}
    </div>
  );
}

export default JobList;