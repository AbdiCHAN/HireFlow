import "./JobCard.css";

function getInitials(name = "") {
  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "HF";
}

function getJobType(job = {}) {
  return job.type || job.jobType || "Remote";
}

function getApplyUrl(job = {}) {
  if (job.applyUrl) return job.applyUrl;
  if (job.applicationUrl) return job.applicationUrl;
  if (job.url) return job.url;

  const title = encodeURIComponent(job.title || "Job");
  const company = encodeURIComponent(job.company || "HireFlow");

  return `mailto:careers@hireflow.com?subject=Application for ${title} at ${company}`;
}

function JobCard({
  job,
  isSaved = false,
  onSave,
  onSelect,
}) {
  if (!job) return null;

  const company = job.company || "Unknown Company";
  const title = job.title || "Untitled Role";
  const type = getJobType(job);
  const tags = Array.isArray(job.tags) ? job.tags : [];

  const handleOpen = () => {
    onSelect?.(job);
  };

  const handleApply = (event) => {
    event.stopPropagation();

    const applyUrl = getApplyUrl(job);
    if (applyUrl && applyUrl !== "#") {
      window.open(applyUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleSave = (event) => {
    event.stopPropagation();

    if (job.id === undefined || job.id === null) return;

    onSave?.(job.id);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOpen();
    }
  };

  return (
    <div
      className="job-card"
      onClick={handleOpen}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="job-card__top">
        <div className="job-card__left">
          <div className="job-card__logo-text">{getInitials(company)}</div>

          <div>
            <p className="job-card__company">{company}</p>
            <h3 className="job-card__title">{title}</h3>
          </div>
        </div>

        <div className="job-card__actions">
          <button
            type="button"
            className="job-card__apply"
            onClick={handleApply}
          >
            Apply
          </button>

          <button
            type="button"
            className={`job-card__save ${
              isSaved ? "job-card__save--saved" : ""
            }`}
            onClick={handleSave}
            aria-label={isSaved ? "Unsave job" : "Save job"}
          >
            {isSaved ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      <p className="job-card__desc">
        {job.description || "No job description has been provided yet."}
      </p>

      {tags.length > 0 && (
        <div className="job-card__tags">
          {tags.map((tag) => (
            <div className="job-card__tag" key={tag}>
              {tag}
            </div>
          ))}
        </div>
      )}

      <div className="job-card__divider" />

      <div className="job-card__footer">
        <div className="job-card__meta">{job.location || "Remote"}</div>
        <div className="job-card__meta">{type}</div>
        {job.salary && <div className="job-card__salary">{job.salary}</div>}
        {job.postedAt && <div className="job-card__meta">{job.postedAt}</div>}
      </div>
    </div>
  );
}

export default JobCard;
