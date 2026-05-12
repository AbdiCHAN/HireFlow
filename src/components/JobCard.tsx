// src/components/JobCard.jsx
import { LOGO_COLORS, normalizeType } from "../services/api";

function badgeClass(type = "") {
  const t = normalizeType(type);

  if (t === "full-time") return "badge--full";
  if (t === "contract") return "badge--contract";
  if (t === "part-time") return "badge--part";
  if (t === "freelance") return "badge--freelance";

  return "badge--remote";
}

function badgeLabel(type = "") {
  const t = normalizeType(type);

  const map = {
    "full-time": "Full-time",
    contract: "Contract",
    "part-time": "Part-time",
    freelance: "Freelance",
    remote: "Remote",
  };

  return map[t] || type || "Remote";
}

function MapPin() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  );
}

function Dollar() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function Heart({ filled }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "#F43F5E" : "none"} stroke={filled ? "#F43F5E" : "currentColor"} strokeWidth="1.5" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function getInitials(name = "") {
  const words = String(name).trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return "HF";

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function getLogoColor(job = {}) {
  const numericId = Number(job.id);
  const companyName = job.company || "HireFlow";

  const seed = Number.isFinite(numericId)
    ? Math.abs(numericId)
    : companyName.length;

  const color = LOGO_COLORS[seed % LOGO_COLORS.length];

  if (typeof color === "string") {
    return {
      bg: color,
      color: "#ffffff",
    };
  }

  return (
    color || {
      bg: "linear-gradient(135deg, #7c3aed, #2563eb)",
      color: "#ffffff",
    }
  );
}

function getApiApplyUrl(job = {}) {
  if (!job.id) return null;

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "";

  if (apiBaseUrl) {
    return `${apiBaseUrl.replace(/\/$/, "")}/api/jobs/${job.id}`;
  }

  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  if (isLocalhost) {
    return `/api/jobs/${job.id}`;
  }

  return null;
}

function createApplyUrl(job = {}) {
  if (job.applyUrl) return job.applyUrl;
  if (job.applicationUrl) return job.applicationUrl;
  if (job.url) return job.url;

  const apiUrl = getApiApplyUrl(job);
  if (apiUrl) return apiUrl;

  const title = encodeURIComponent(job.title || "Job");
  const company = encodeURIComponent(job.company || "HireFlow");

  return `mailto:careers@hireflow.com?subject=Application for ${title} at ${company}`;
}

function JobCard({
  job,
  isSaved = false,
  onSave,
  onSelect,
  onSelectJob,
  animDelay = 0,
}) {
  if (!job) return null;

  const logoColor = getLogoColor(job);
  const type = job.jobType || job.type || "remote";
  const company = job.company || "Unknown Company";
  const title = job.title || "Untitled Role";
  const location = job.location || "Remote";
  const description =
    job.description || "No job description has been provided yet.";
  const tags = Array.isArray(job.tags) ? job.tags : [];
  const selectJob = onSelect || onSelectJob;

  const handleOpen = () => {
    selectJob?.(job);
  };

  const handleApply = (event) => {
    event.stopPropagation();

    const applyUrl = createApplyUrl(job);

    window.open(applyUrl, "_blank", "noopener,noreferrer");
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
      style={{ animationDelay: `${animDelay}s` }}
      onClick={handleOpen}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="job-card__top">
        <div className="job-card__left">
          {job.companyLogo ? (
            <div className="job-card__logo">
              <img src={job.companyLogo} alt={`${company} logo`} />
            </div>
          ) : (
            <div
              className="job-card__logo-text"
              style={{
                background: logoColor.bg,
                color: logoColor.color,
              }}
            >
              {getInitials(company)}
            </div>
          )}

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
            <Heart filled={isSaved} />
          </button>
        </div>
      </div>

      <p className="job-card__desc">{description}</p>

      {tags.length > 0 && (
        <div className="job-card__tags">
          {tags.map((tag) => (
            <span className="job-card__tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="job-card__divider" />

      <div className="job-card__footer">
        <span className="job-card__meta">
          <MapPin />
          {location}
        </span>

        <span className="job-card__meta">
          <HomeIcon />
          <span className={`badge ${badgeClass(type)}`}>
            {badgeLabel(type)}
          </span>
        </span>

        {job.salary && (
          <span className="job-card__salary">
            <Dollar />
            {job.salary}
          </span>
        )}
      </div>
    </div>
  );
}

export default JobCard;