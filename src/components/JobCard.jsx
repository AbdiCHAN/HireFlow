import "./jobCard.css";

function getInitials(name = "") {
  return (
    String(name)
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "HF"
  );
}

function titleCase(value = "") {
  return String(value)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function JobCard({ job, isSaved = false, onSave, onSelect, onApply }) {
  if (!job) return null;

  const company = job.company || "Unknown Company";
  const type = job.jobType || job.type || "remote";
  const tags = Array.isArray(job.tags) ? job.tags.slice(0, 5) : [];

  return (
    <article className="job-card">
      <div className="job-card__head">
        <div className="job-card__logo" aria-hidden="true">
          {job.companyLogo ? <img src={job.companyLogo} alt="" /> : getInitials(company)}
        </div>
        <div className="job-card__company">{company}</div>
        <button
          className="job-card__save"
          type="button"
          aria-label={isSaved ? "Unsave job" : "Save job"}
          aria-pressed={isSaved}
          onClick={() => onSave?.(job.id)}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill={isSaved ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6z" />
          </svg>
        </button>
      </div>

      <button className="job-card__title" type="button" onClick={() => onSelect?.(job)}>
        {job.title || "Untitled role"}
      </button>

      <p className="job-card__description">
        {job.description || "No description available yet."}
      </p>

      {tags.length > 0 && (
        <div className="job-card__tags">
          {tags.map((tag) => (
            <span className="job-card__tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="job-card__line" />

      <div className="job-card__meta">
        <span>{job.location || "Remote"}</span>
        <span>{titleCase(type)}</span>
      </div>

      <div className="job-card__bottom">
        <span className="job-card__salary">{job.salary || "Salary shared after intro"}</span>
        <button className="job-card__apply" type="button" onClick={() => onApply?.(job)}>
          Apply
        </button>
      </div>
    </article>
  );
}

export default JobCard;
