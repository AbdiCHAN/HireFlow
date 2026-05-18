import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { applyToJob, openApplyUrl } from "../services/api";

function initials(name = "HF") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function titleCase(value = "") {
  return value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function JobDetails({ job, onBack, isSaved, onSave, onNavigate }) {
  const { isAuthenticated } = useAuth();
  const [message, setMessage] = useState("");

  if (!job) {
    return (
      <div className="workspace-page">
        <section className="workspace-card">
          <h1>Job not found.</h1>
          <button className="btn btn--primary" type="button" onClick={onBack}>
            Back to jobs
          </button>
        </section>
      </div>
    );
  }

  const apply = async () => {
    if (!isAuthenticated) {
      onNavigate("login");
      return;
    }

    if (job.source !== "local") {
      openApplyUrl(job);
      return;
    }

    try {
      await applyToJob(job.id, `I am interested in ${job.title} at ${job.company}.`);
      setMessage("Application submitted.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="detail-page">
      <button className="detail-back" type="button" onClick={onBack}>
        Back to jobs
      </button>

      <section className="detail-layout">
        <article className="detail-card">
          <div className="detail-card__banner" />
          <div className="detail-card__logo">{initials(job.company)}</div>
          <p className="eyebrow">{job.company}</p>
          <h1>{job.title}</h1>
          <div className="detail-card__meta">
            <span>{job.location || "Remote"}</span>
            <span>{titleCase(job.jobType || "remote")}</span>
            {job.postedAt && <span>{job.postedAt}</span>}
            {job.source && <span>via {job.source}</span>}
          </div>

          <h2>About the role</h2>
          <p>{job.fullDescription || job.description}</p>

          {job.tags?.length > 0 && (
            <>
              <h2>Skills and tools</h2>
              <div className="tag-row">
                {job.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </>
          )}
        </article>

        <aside className="detail-side">
          <div className="detail-side__salary">
            <span>Compensation</span>
            <strong>{job.salary || "Shared during interview"}</strong>
          </div>
          <button className="btn btn--primary" type="button" onClick={apply}>
            Apply now
          </button>
          <button className="btn btn--outline" type="button" onClick={() => onSave?.(job.id)}>
            {isSaved ? "Saved" : "Save job"}
          </button>
          {message && <p className="form-message">{message}</p>}
          <dl className="detail-facts">
            <div>
              <dt>Job type</dt>
              <dd>{titleCase(job.jobType || "remote")}</dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>{titleCase(job.category || "general")}</dd>
            </div>
            <div>
              <dt>Source</dt>
              <dd>{job.source || "HireFlow"}</dd>
            </div>
          </dl>
        </aside>
      </section>
    </div>
  );
}

export default JobDetails;
