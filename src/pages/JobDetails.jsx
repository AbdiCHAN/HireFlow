import { LOGO_COLORS, normalizeType } from "../services/api";

function getInitials(n = "") {
  return n.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

function badgeLabel(t = "") {
  const m = { "full-time": "Full-time", "contract": "Contract", "part-time": "Part-time", "freelance": "Freelance", "remote": "Remote" };
  return m[normalizeType(t)] || t;
}

function JobDetails({ job, onBack, isSaved, onSave }) {
  if (!job) return (
    <div className="detail-page">
      <div className="detail-back" onClick={onBack} role="button" tabIndex={0}>Back to jobs</div>
      <div className="detail-empty">Job not found.</div>
    </div>
  );

  const lc = LOGO_COLORS[job.id % LOGO_COLORS.length];
  const type = job.jobType || "full-time";

  return (
    <div className="detail-page">
      <div className="detail-back" onClick={onBack} role="button" tabIndex={0}>Back to jobs</div>

      <div className="detail-layout">
        <div className="detail-card">
          <div className="detail-card__banner" />

          <div className="detail-card__logo" style={job.companyLogo ? { backgroundColor: 'var(--surface2)', backgroundImage: `url(${job.companyLogo})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' } : { background: lc.bg, color: lc.color }}>
            {!job.companyLogo && getInitials(job.company)}
          </div>

          <div className="detail-card__company">{job.company}</div>
          <div className="detail-card__title">{job.title}</div>

          <div className="detail-card__meta">
            <div className="detail-card__tag">{job.location}</div>
            <div className="detail-card__tag">{badgeLabel(type)}</div>
            {job.postedAt && <div className="detail-card__tag">{job.postedAt}</div>}
            {job.source && <div className="detail-card__tag">via {job.source}</div>}
          </div>

          <div className="detail-card__section">About the role</div>
          <div className="detail-card__text">{job.fullDescription || job.description}</div>

          {job.tags?.length > 0 && (
            <>
              <div className="detail-card__section">Skills &amp; Technologies</div>
              <div className="detail-card__tags">
                {job.tags.map(tag => <div className="detail-card__tag" key={tag}>{tag}</div>)}
              </div>
            </>
          )}
        </div>

        <div className="detail-side">
          {job.salary && (
            <div className="detail-side__salary">
              <div className="detail-side__salary-lbl">Compensation</div>
              <div className="detail-side__salary-val">{job.salary}</div>
            </div>
          )}

          <div className="detail-side__apply" onClick={() => job.url && job.url !== "#" && window.open(job.url, "_blank")} role="button" tabIndex={0}>Apply Now</div>

          <div className={`detail-side__save ${isSaved ? "detail-side__save--saved" : ""}`} onClick={() => onSave?.(job.id)} role="button" tabIndex={0}>
            {isSaved ? "Saved" : "Save Job"}
          </div>

          <div className="detail-side__rows">
            <div className="detail-side__row">
              <div className="detail-side__row-key">Job Type</div>
              <div className="detail-side__row-val" style={{ textTransform: 'capitalize' }}>{badgeLabel(type)}</div>
            </div>

            <div className="detail-side__row">
              <div className="detail-side__row-key">Location</div>
              <div className="detail-side__row-val" style={{ textTransform: 'capitalize' }}>{job.location}</div>
            </div>

            <div className="detail-side__row">
              <div className="detail-side__row-key">Category</div>
              <div className="detail-side__row-val" style={{ textTransform: 'capitalize' }}>{job.rawCategory || job.category || 'General'}</div>
            </div>
          </div>

          <div className="detail-side" style={{ background: 'linear-gradient(135deg,#100E2E,#1A1648)', border: '1px solid rgba(124,92,252,.25)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--violet-lt)', marginBottom: 8 }}>Similar Roles</div>
            <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 16 }}>Discover more {job.rawCategory || job.category} positions across top companies globally.</div>
            <div onClick={onBack} className="detail-back" role="button" tabIndex={0} style={{ width: '100%', textAlign: 'center' }}>Browse All Jobs</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobDetails;