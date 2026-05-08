// src/pages/JobDetails.jsx

const LOGO_PALETTE = [
    { bg:"#DBEAFE", color:"#1D4ED8" },
    { bg:"#D1FAE5", color:"#065F46" },
    { bg:"#FEF3C7", color:"#92400E" },
    { bg:"#EDE9FE", color:"#5B21B6" },
    { bg:"#FCE7F3", color:"#9D174D" },
    { bg:"#CFFAFE", color:"#164E63" },
    { bg:"#FEE2E2", color:"#991B1B" },
  ];
  
  function getInitials(name="") { return name.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase(); }
  function getLogo(id) { return LOGO_PALETTE[id % LOGO_PALETTE.length]; }
  
  /* icons */
  function Pin()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>; }
  function Bag()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>; }
  function Clock(){ return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
  function Globe(){ return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z"/></svg>; }
  function ArrowLeft() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>; }
  
  function JobDetails({ job, onBack, isSaved, onSave }) {
    if (!job) return (
      <div className="container" style={{ padding:"40px 0" }}>
        <button className="back-btn" onClick={onBack}><ArrowLeft /> Back to jobs</button>
        <p style={{ color:"var(--ink3)" }}>Job not found.</p>
      </div>
    );
  
    const logo    = getLogo(job.id);
    const jobType = job.jobType || job.type || "Full-time";
    const cleanDesc = job.description
      ? job.description.replace(/<[^>]*>/g," ").replace(/\s{2,}/g," ").trim()
      : "No description provided.";
  
    return (
      <div className="container">
        <div className="detail-layout">
  
          {/* ── MAIN ── */}
          <div>
            <button className="back-btn" onClick={onBack}><ArrowLeft /> Back to jobs</button>
  
            <div className="detail-main">
              <div className="detail-main__banner" />
              <div className="detail-main__body">
                {/* Company logo */}
                <div className="detail-main__logo" style={{ background:logo.bg, color:logo.color }}>
                  {job.companyLogo
                    ? <img src={job.companyLogo} alt={job.company} style={{ width:"100%", height:"100%", objectFit:"contain", borderRadius:10 }} />
                    : getInitials(job.company)
                  }
                </div>
  
                <h1 className="detail-main__title">{job.title}</h1>
                <p className="detail-main__company">{job.company}</p>
  
                {/* Chips */}
                <div className="detail-main__chips">
                  <span className="detail-main__chip"><Pin /> {job.location}</span>
                  <span className="detail-main__chip"><Bag /> {jobType}</span>
                  {(job.postedAt || job.publicationDate) && (
                    <span className="detail-main__chip">
                      <Clock /> {job.postedAt || new Date(job.publicationDate).toLocaleDateString()}
                    </span>
                  )}
                  {job.source && (
                    <span className="detail-main__chip"><Globe /> via {job.source}</span>
                  )}
                </div>
  
                <div className="detail-main__divider" />
  
                {/* Description */}
                <h2 className="detail-main__section-title">About the role</h2>
                <p className="detail-main__text">{cleanDesc}</p>
  
                {/* Skills */}
                {job.tags?.length > 0 && (
                  <>
                    <div className="detail-main__divider" />
                    <h2 className="detail-main__section-title">Skills &amp; technologies</h2>
                    <div className="detail-main__tags">
                      {job.tags.map(tag => (
                        <span className="job-card__tag" key={tag}>{tag}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
  
          {/* ── SIDEBAR ── */}
          <div className="detail-sidebar">
            <div className="detail-sidebar-card">
              {/* Salary */}
              {job.salary && (
                <>
                  <p className="detail-sidebar__salary-label">Compensation</p>
                  <p className="detail-sidebar__salary-val">{job.salary}</p>
                </>
              )}
  
              {/* CTA buttons */}
              <button
                className="detail-sidebar__apply"
                onClick={() => job.url && job.url !== "#" && window.open(job.url,"_blank")}
              >
                Apply Now →
              </button>
              <button
                className={`detail-sidebar__save ${isSaved ? "detail-sidebar__save--saved" : ""}`}
                onClick={() => onSave?.(job.id)}
              >
                {isSaved ? "❤️ Saved" : "🤍 Save Job"}
              </button>
  
              {/* Meta rows */}
              <div className="detail-sidebar__rows">
                {[
                  [<Bag key="b"/>,   "Job type",  jobType],
                  [<Pin key="p"/>,   "Location",  job.location],
                  [<Globe key="g"/>, "Category",  job.category || "General"],
                ].map(([icon, key, val]) => (
                  <div className="detail-sidebar__row" key={key}>
                    <span className="detail-sidebar__row-key">{icon} {key}</span>
                    <span className="detail-sidebar__row-val" style={{ textTransform:"capitalize" }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
  
            {/* Similar jobs prompt */}
            <div className="promo-card" style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--r-lg)", padding:"18px" }}>
              <p className="promo-card__title" style={{ fontFamily:"var(--font-display)", fontSize:15, fontWeight:700, color:"var(--ink)", marginBottom:10 }}>
                Similar Roles
              </p>
              <p style={{ fontSize:13, color:"var(--ink3)", lineHeight:1.6 }}>
                Explore more {job.category} positions across top companies in Africa and remote-first teams worldwide.
              </p>
              <button
                onClick={onBack}
                style={{ marginTop:14, width:"100%", height:38, background:"var(--brand-bg)", border:"1.5px solid var(--brand-lt)", borderRadius:"var(--r-pill)", color:"var(--brand)", fontSize:13, fontWeight:700, cursor:"pointer" }}
              >
                Browse All Jobs
              </button>
            </div>
          </div>
  
        </div>
      </div>
    );
  }
  
  export default JobDetails;