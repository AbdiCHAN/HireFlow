// src/components/JobList.jsx
import JobCard from "./JobCard";

function JobList({ jobs = [], savedIds, onSave, onSelect }) {
  if (jobs.length === 0) {
    return (
      <div className="job-list__empty">
        <div className="job-list__empty-emoji">🔍</div>
        <h3 className="job-list__empty-title">No jobs found</h3>
        <p>Try adjusting your search or filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="job-list__grid">
      {jobs.map((job, i) => (
        <JobCard
          key={job.id}
          job={job}
          isSaved={savedIds?.has(job.id)}
          onSave={onSave}
          onSelect={onSelect}
          animDelay={i * 0.055}
        />
      ))}
    </div>
  );
}

export default JobList;