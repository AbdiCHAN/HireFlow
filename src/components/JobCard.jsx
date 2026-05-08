// src/components/JobCard.jsx

const LOGO_PALETTE = [
  { bg: "#DBEAFE", color: "#1D4ED8" },
  { bg: "#D1FAE5", color: "#065F46" },
  { bg: "#FEF3C7", color: "#92400E" },
  { bg: "#EDE9FE", color: "#5B21B6" },
  { bg: "#FCE7F3", color: "#9D174D" },
  { bg: "#CFFAFE", color: "#164E63" },
  { bg: "#FEE2E2", color: "#991B1B" },
];

function getInitials(name = "") {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function getLogo(id) { return LOGO_PALETTE[id % LOGO_PALETTE.length]; }

function badgeClass(type = "") {
  const t = type.toLowerCase();
  if (t.includes("full"))     return "badge--full";
  if (t.includes("contract")) return "badge--contract";
  if (t.includes("part"))     return "badge--part";
  return "badge--remote";
}

/* ── icons ── */
function MapPin() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
}
function Clock() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function Heart({ filled }) {
  return filled
    ? <svg width="17" height="17" viewBox="0 0 24 24" fill="#B91C1C" stroke="#B91C1C" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
    : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
}

function JobCard({ job, isSaved, onSave, onSelect, animDelay = 0 }) {
  const logo    = getLogo(job.id);
  const jobType = job.jobType || job.type || "Full-time";

  return (
    <div
      className={`job-card ${job.featured ? "job-card--featured" : ""}`}
      style={{ animationDelay: `${animDelay}s` }}
      onClick={() => onSelect?.(job)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect?.(job)}
    >
      {/* Top row: logo + info + save */}
      <div className="job-card__top">
        <div className="job-card__logo" style={{ background: logo.bg, color: logo.color }}>
          {job.companyLogo
            ? <img src={job.companyLogo} alt={job.company} />
            : getInitials(job.company)
          }
        </div>

        <div className="job-card__info">
          <h3 className="job-card__title">{job.title}</h3>
          <p className="job-card__company">{job.company}</p>
          <p className="job-card__location">
            <MapPin /> {job.location}
          </p>
        </div>

        <div className="job-card__actions">
          <button
            className={`job-card__save ${isSaved ? "job-card__save--active" : ""}`}
            onClick={(e) => { e.stopPropagation(); onSave?.(job.id); }}
            aria-label={isSaved ? "Unsave job" : "Save job"}
          >
            <Heart filled={isSaved} />
          </button>
          {job.featured && <span className="badge badge--featured">★ Featured</span>}
          <span className={`badge ${badgeClass(jobType)}`}>{jobType}</span>
        </div>
      </div>

      {/* Description */}
      <p className="job-card__desc">{job.description}</p>

      {/* Tags */}
      {job.tags?.length > 0 && (
        <div className="job-card__tags">
          {job.tags.slice(0, 5).map((tag) => (
            <span className="job-card__tag" key={tag}>{tag}</span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="job-card__footer">
        <div className="job-card__meta">
          <span className="job-card__meta-item"><Clock /> {job.postedAt || job.publicationDate || "Recently"}</span>
          {job.salary && <span className="job-card__salary">{job.salary}</span>}
        </div>
        <button
          className="job-card__apply"
          onClick={(e) => { e.stopPropagation(); onSelect?.(job); }}
        >
          View Job
        </button>
      </div>
    </div>
  );
}

export default JobCard;