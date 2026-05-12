// src/pages/JobDetails.jsx
import { LOGO_COLORS, normalizeType } from "../services/api";

function getInitials(n=""){return n.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase();}
function badgeLabel(t=""){
  const m={"full-time":"Full-time","contract":"Contract","part-time":"Part-time","freelance":"Freelance","remote":"Remote"};
  return m[normalizeType(t)]||t;
}
function ArrowLeft(){return<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;}
function Pin(){return<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;}
function Bag(){return<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>;}
function Clock(){return<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;}
function Globe(){return<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10A15 15 0 0 1 12 2z"/></svg>;}

function JobDetails({ job, onBack, isSaved, onSave }) {
  if (!job) return (
    <div className="container detail-page">
      <button className="back-btn" onClick={onBack}><ArrowLeft/> Back to jobs</button>
      <p style={{color:"var(--text3)"}}>Job not found.</p>
    </div>
  );

  const lc = LOGO_COLORS[job.id % LOGO_COLORS.length];
  const type = job.jobType || "full-time";

  return (
    <div className="container detail-page">
      <button className="back-btn" onClick={onBack}><ArrowLeft/> Back to jobs</button>

      <div className="detail-grid">
        <div className="detail-card">
          <div className="detail-card__banner"/>
          <div className="detail-card__body">
            {job.companyLogo
              ? <div className="detail-card__logo" style={{background:"var(--surface2)"}}><img src={job.companyLogo} alt={job.company} style={{width:"100%",height:"100%",objectFit:"contain",borderRadius:10}}/></div>
              : <div className="detail-card__logo" style={{background:lc.bg,color:lc.color}}>{getInitials(job.company)}</div>
            }
            <p className="detail-card__company">{job.company}</p>
            <h1 className="detail-card__title">{job.title}</h1>

            <div className="detail-card__chips">
              <span className="detail-card__chip"><Pin/> {job.location}</span>
              <span className="detail-card__chip"><Bag/> {badgeLabel(type)}</span>
              {job.postedAt && <span className="detail-card__chip"><Clock/> {job.postedAt}</span>}
              {job.source   && <span className="detail-card__chip"><Globe/> via {job.source}</span>}
            </div>

            <h2 className="detail-card__section">About the role</h2>
            <p className="detail-card__text">{job.fullDescription || job.description}</p>

            {job.tags?.length > 0 && (
              <>
                <h2 className="detail-card__section">Skills &amp; Technologies</h2>
                <div className="detail-card__tags">
                  {job.tags.map(tag=><span className="job-card__tag" key={tag}>{tag}</span>)}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="detail-sidebar">
          <div className="detail-side">
            {job.salary && (
              <>
                <p className="detail-side__salary-lbl">Compensation</p>
                <p className="detail-side__salary">{job.salary}</p>
              </>
            )}
            <button
              className="detail-side__apply"
              onClick={() => job.url && job.url!=="#" && window.open(job.url,"_blank")}
            >Apply Now →</button>
            <button
              className={`detail-side__save ${isSaved?"detail-side__save--saved":""}`}
              onClick={() => onSave?.(job.id)}
            >{isSaved?"❤️ Saved":"🤍 Save Job"}</button>

            <div className="detail-side__rows">
              {[
                [<Bag key="b"/>,"Job Type",  badgeLabel(type)],
                [<Pin key="p"/>,"Location",  job.location],
                [<Globe key="g"/>,"Category",job.rawCategory||job.category||"General"],
              ].map(([icon,key,val])=>(
                <div className="detail-side__row" key={key}>
                  <span className="detail-side__row-key">{icon} {key}</span>
                  <span className="detail-side__row-val" style={{textTransform:"capitalize"}}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="detail-side" style={{background:"linear-gradient(135deg,#100E2E,#1A1648)",border:"1px solid rgba(124,92,252,.25)"}}>
            <p style={{fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"var(--violet-lt)",marginBottom:8}}>Similar Roles</p>
            <p style={{fontSize:14,color:"var(--text2)",lineHeight:1.65,marginBottom:16}}>
              Discover more {job.rawCategory||job.category} positions across top companies globally.
            </p>
            <button onClick={onBack} className="btn btn--outline" style={{width:"100%",justifyContent:"center"}}>
              Browse All Jobs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobDetails;