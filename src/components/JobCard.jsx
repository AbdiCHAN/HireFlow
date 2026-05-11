// src/components/JobCard.jsx
import { LOGO_COLORS, normalizeType } from "../services/api";

function badgeClass(type="") {
  const t = normalizeType(type);
  if (t === "full-time")  return "badge--full";
  if (t === "contract")   return "badge--contract";
  if (t === "part-time")  return "badge--part";
  if (t === "freelance")  return "badge--freelance";
  return "badge--remote";
}

function badgeLabel(type="") {
  const t = normalizeType(type);
  const map = {"full-time":"Full-time","contract":"Contract","part-time":"Part-time","freelance":"Freelance","remote":"Remote"};
  return map[t] || type;
}

function MapPin() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
}
function Home2() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>;
}
function Dollar() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
}
function Heart({ filled }) {
  return filled
    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="#F43F5E" stroke="#F43F5E" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
}

function getInitials(name="") {
  return name.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase();
}

function JobCard({ job, isSaved, onSave, onSelect, animDelay=0 }) {
  const lc  = LOGO_COLORS[job.id % LOGO_COLORS.length];
  const type = job.jobType || "full-time";

  return (
    <div
      className="job-card"
      style={{ animationDelay:`${animDelay}s` }}
      onClick={() => onSelect?.(job)}
      role="button" tabIndex={0}
      onKeyDown={e => e.key==="Enter" && onSelect?.(job)}
    >
      <div className="job-card__top">
        <div className="job-card__left">
          {/* Company logo */}
          {job.companyLogo
            ? <div className="job-card__logo"><img src={job.companyLogo} alt={job.company} /></div>
            : <div className="job-card__logo-text" style={{background:lc.bg,color:lc.color}}>{getInitials(job.company)}</div>
          }
          <div>
            <p className="job-card__company">{job.company}</p>
            <h3 className="job-card__title">{job.title}</h3>
          </div>
        </div>

        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6,flexShrink:0}}>
          <button
            className="job-card__apply"
            onClick={e => { e.stopPropagation(); onSelect?.(job); }}
          >Apply</button>
          <button
            style={{background:"none",border:"none",cursor:"pointer",color:isSaved?"#F43F5E":"var(--text3)",padding:4,transition:"color .2s"}}
            onClick={e => { e.stopPropagation(); onSave?.(job.id); }}
            aria-label={isSaved?"Unsave":"Save"}
          ><Heart filled={isSaved}/></button>
        </div>
      </div>

      {/* Description */}
      <p className="job-card__desc">{job.description}</p>

      {/* Tags */}
      {job.tags?.length > 0 && (
        <div className="job-card__tags">
          {job.tags.map(tag => <span className="job-card__tag" key={tag}>{tag}</span>)}
        </div>
      )}

      <div className="job-card__divider" />

      {/* Footer */}
      <div className="job-card__footer">
        <span className="job-card__meta"><MapPin /> {job.location}</span>
        <span className="job-card__meta"><Home2 /> {badgeLabel(type)}</span>
        {job.salary && <span className="job-card__salary"><Dollar />{job.salary}</span>}
        <span className={`badge ${badgeClass(type)}`} style={{marginLeft:"auto"}}>{badgeLabel(type)}</span>
      </div>
    </div>
  );
}

export default JobCard;