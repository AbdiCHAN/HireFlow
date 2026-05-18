import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  createApiKey,
  createJob,
  deleteApplication,
  deleteJob,
  fetchApiKeys,
  fetchApplications,
  fetchCv,
  fetchMyApplications,
  fetchMyJobs,
  revokeApiKey,
  saveCv,
  toggleApiKey,
  updateApplicationStatus,
  updateJob,
} from "../services/api";

const emptyJob = {
  title: "",
  company: "",
  location: "Remote",
  jobType: "remote",
  category: "engineering",
  salary: "",
  tags: "",
  applyUrl: "",
  description: "",
};

const content = {
  about: {
    eyebrow: "About HireFlow",
    title: "A focused workspace for hiring and job discovery.",
    body: "HireFlow combines a polished job feed with authenticated workflows for posting jobs, applying, managing keys, and maintaining a candidate profile.",
  },
  candidates: {
    eyebrow: "Candidate pipeline",
    title: "Shortlist stronger profiles with less back-and-forth.",
    body: "Candidates can save roles, upload profile details, and track submitted applications from one place.",
  },
  network: {
    eyebrow: "Network",
    title: "Follow companies and keep hiring signals close.",
    body: "The workspace highlights fast-moving teams and lets users return to roles without losing context.",
  },
  messages: {
    eyebrow: "Messages",
    title: "Keep communication clear after every application.",
    body: "Use the application dashboard to review status changes and keep next steps visible.",
  },
  news: {
    eyebrow: "News",
    title: "Hiring pulse for remote and local tech roles.",
    body: "HireFlow surfaces hiring trends, active companies, and recommended roles directly beside the feed.",
  },
};

function initials(name = "HF") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function AuthPrompt({ onNavigate, title = "Sign in required" }) {
  return (
    <section className="workspace-card auth-required">
      <p className="eyebrow">Secure workspace</p>
      <h1>{title}</h1>
      <p>Log in or create an account to use this authenticated HireFlow feature.</p>
      <div className="button-row">
        <button className="btn btn--primary" type="button" onClick={() => onNavigate("login")}>
          Login
        </button>
        <button className="btn btn--outline" type="button" onClick={() => onNavigate("signup")}>
          Join
        </button>
      </div>
    </section>
  );
}

function InfoPage({ page = "about", onNavigate }) {
  const data = content[page] || content.about;

  return (
    <div className="workspace-page">
      <section className="workspace-card workspace-hero">
        <p className="eyebrow">{data.eyebrow}</p>
        <h1>{data.title}</h1>
        <p>{data.body}</p>
        <div className="button-row">
          <button className="btn btn--primary" type="button" onClick={() => onNavigate("jobs")}>
            Browse jobs
          </button>
          <button className="btn btn--outline" type="button" onClick={() => onNavigate("post-job")}>
            Post a job
          </button>
        </div>
      </section>
    </div>
  );
}

export function AboutPage(props) {
  return <InfoPage page="about" {...props} />;
}

export function CandidatesPage(props) {
  return <InfoPage page="candidates" {...props} />;
}

export function NetworkPage(props) {
  return <InfoPage page="network" {...props} />;
}

export function MessagesPage(props) {
  return <InfoPage page="messages" {...props} />;
}

export function NewsPage(props) {
  return <InfoPage page="news" {...props} />;
}

export function CategoriesPage({ onCategorySelect }) {
  const categories = ["engineering", "design", "marketing", "management", "finance", "development"];

  return (
    <div className="workspace-page">
      <section className="workspace-card workspace-hero">
        <p className="eyebrow">Categories</p>
        <h1>Explore roles by hiring lane.</h1>
        <p>Jump into a curated feed for the role family you care about most.</p>
        <div className="category-grid">
          {categories.map((category) => (
            <button key={category} type="button" onClick={() => onCategorySelect(category)}>
              <span>{initials(category)}</span>
              <strong>{category}</strong>
              <small>Open matching jobs</small>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export function ApiKeysPage({ onNavigate }) {
  const { isAuthenticated } = useAuth();
  const [keys, setKeys] = useState([]);
  const [name, setName] = useState("HireFlow API Key");
  const [createdKey, setCreatedKey] = useState("");
  const [message, setMessage] = useState("");

  const loadKeys = async () => {
    const data = await fetchApiKeys();
    setKeys(data);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadKeys().catch((error) => setMessage(error.message));
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return <AuthPrompt onNavigate={onNavigate} title="Login to manage API keys" />;

  const handleCreate = async (event) => {
    event.preventDefault();

    try {
      const result = await createApiKey(name);
      setCreatedKey(result.data?.key || "");
      setMessage("API key created.");
      await loadKeys();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleToggle = async (id) => {
    await toggleApiKey(id);
    await loadKeys();
  };

  const handleDelete = async (id) => {
    await revokeApiKey(id);
    await loadKeys();
  };

  return (
    <div className="workspace-page">
      <section className="workspace-card">
        <p className="eyebrow">Developer access</p>
        <h1>API keys</h1>
        <p>Create and revoke keys tied to your signed-in account.</p>

        <form className="inline-form" onSubmit={handleCreate}>
          <input value={name} onChange={(event) => setName(event.target.value)} />
          <button className="btn btn--primary" type="submit">Create key</button>
        </form>

        {createdKey && (
          <div className="secret-box">
            <span>Copy once:</span>
            <code>{createdKey}</code>
          </div>
        )}
        {message && <p className="form-message">{message}</p>}

        <div className="table-list">
          {keys.map((key) => (
            <div className="table-row" key={key.id}>
              <div>
                <strong>{key.name}</strong>
                <small>{key.keyPreview}  -  {key.isActive ? "Active" : "Paused"}</small>
              </div>
              <div className="button-row">
                <button className="btn btn--outline" type="button" onClick={() => handleToggle(key.id)}>
                  {key.isActive ? "Pause" : "Activate"}
                </button>
                <button className="btn btn--danger" type="button" onClick={() => handleDelete(key.id)}>
                  Revoke
                </button>
              </div>
            </div>
          ))}
          {keys.length === 0 && <p className="empty-copy">No API keys yet.</p>}
        </div>
      </section>
    </div>
  );
}

export function PostJobPage({ onNavigate, onJobsChange }) {
  const { user, isAuthenticated } = useAuth();
  const [form, setForm] = useState(emptyJob);
  const [editingId, setEditingId] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState("");

  const canPost = user?.role === "employer" || user?.role === "admin";

  const loadWorkspace = async () => {
    const [myJobs, incoming] = await Promise.all([
      fetchMyJobs().catch(() => []),
      fetchApplications().catch(() => []),
    ]);
    setJobs(myJobs);
    setApplications(incoming);
  };

  useEffect(() => {
    if (isAuthenticated && canPost) {
      loadWorkspace().catch((error) => setMessage(error.message));
    }
  }, [isAuthenticated, canPost]);

  if (!isAuthenticated) return <AuthPrompt onNavigate={onNavigate} title="Login to post and manage jobs" />;

  if (!canPost) {
    return (
      <div className="workspace-page">
        <section className="workspace-card workspace-hero">
          <p className="eyebrow">Employer access</p>
          <h1>Post jobs from an employer account.</h1>
          <p>Create a recruiter account to publish roles and manage incoming applications securely.</p>
          <button className="btn btn--primary" type="button" onClick={() => onNavigate("signup")}>
            Create recruiter account
          </button>
        </section>
      </div>
    );
  }

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setForm(emptyJob);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    };

    try {
      if (editingId) {
        await updateJob(editingId, payload);
        setMessage("Job updated.");
      } else {
        await createJob(payload);
        setMessage("Job posted.");
      }
      resetForm();
      await loadWorkspace();
      if (onJobsChange) onJobsChange();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleEdit = (job) => {
    setEditingId(job.id);
    setForm({
      title: job.title || "",
      company: job.company || "",
      location: job.location || "Remote",
      jobType: job.jobType || "remote",
      category: job.category || "engineering",
      salary: job.salary || "",
      tags: Array.isArray(job.tags) ? job.tags.join(", ") : "",
      applyUrl: job.applyUrl || "",
      description: job.fullDescription || job.description || "",
    });
  };

  const handleDelete = async (id) => {
    await deleteJob(id);
    await loadWorkspace();
    if (onJobsChange) onJobsChange();
  };

  const groupedApplications = applications.slice(0, 8);

  return (
    <div className="workspace-page workspace-page--split">
      <section className="workspace-card">
        <p className="eyebrow">Employer desk</p>
        <h1>{editingId ? "Edit job" : "Post a job"}</h1>
        <form className="job-form" onSubmit={handleSubmit}>
          <label>
            Job title
            <input value={form.title} onChange={(event) => setField("title", event.target.value)} required />
          </label>
          <label>
            Company
            <input value={form.company} onChange={(event) => setField("company", event.target.value)} required />
          </label>
          <label>
            Location
            <input value={form.location} onChange={(event) => setField("location", event.target.value)} />
          </label>
          <label>
            Type
            <select value={form.jobType} onChange={(event) => setField("jobType", event.target.value)}>
              <option value="remote">Remote</option>
              <option value="full-time">Full-time</option>
              <option value="contract">Contract</option>
              <option value="part-time">Part-time</option>
              <option value="freelance">Freelance</option>
            </select>
          </label>
          <label>
            Category
            <select value={form.category} onChange={(event) => setField("category", event.target.value)}>
              <option value="engineering">Engineering</option>
              <option value="design">Design</option>
              <option value="marketing">Marketing</option>
              <option value="management">Management</option>
              <option value="finance">Finance</option>
              <option value="development">Development</option>
            </select>
          </label>
          <label>
            Salary
            <input value={form.salary} onChange={(event) => setField("salary", event.target.value)} />
          </label>
          <label>
            Tags
            <input value={form.tags} onChange={(event) => setField("tags", event.target.value)} placeholder="React, Flask, SQL" />
          </label>
          <label>
            Apply URL
            <input value={form.applyUrl} onChange={(event) => setField("applyUrl", event.target.value)} />
          </label>
          <label className="job-form__wide">
            Description
            <textarea value={form.description} onChange={(event) => setField("description", event.target.value)} rows="6" required />
          </label>
          <div className="button-row job-form__wide">
            <button className="btn btn--primary" type="submit">
              {editingId ? "Save job" : "Publish job"}
            </button>
            {editingId && (
              <button className="btn btn--outline" type="button" onClick={resetForm}>
                Cancel edit
              </button>
            )}
          </div>
        </form>
        {message && <p className="form-message">{message}</p>}
      </section>

      <section className="workspace-card">
        <p className="eyebrow">Your jobs</p>
        <h2>Manage resources</h2>
        <div className="table-list">
          {jobs.map((job) => (
            <div className="table-row" key={job.id}>
              <div>
                <strong>{job.title}</strong>
                <small>{job.company}  -  {job.location}</small>
              </div>
              <div className="button-row">
                <button className="btn btn--outline" type="button" onClick={() => handleEdit(job)}>
                  Edit
                </button>
                <button className="btn btn--danger" type="button" onClick={() => handleDelete(job.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
          {jobs.length === 0 && <p className="empty-copy">No jobs posted yet.</p>}
        </div>

        <div className="divider" />
        <p className="eyebrow">Applications</p>
        <div className="table-list">
          {groupedApplications.map((application) => (
            <div className="table-row" key={application.id}>
              <div>
                <strong>{application.applicantName || "Applicant"}</strong>
                <small>{application.jobTitle}  -  {application.status}</small>
              </div>
              <select
                value={application.status}
                onChange={async (event) => {
                  await updateApplicationStatus(application.id, event.target.value);
                  await loadWorkspace();
                }}
              >
                <option value="submitted">Submitted</option>
                <option value="reviewing">Reviewing</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          ))}
          {groupedApplications.length === 0 && <p className="empty-copy">No applications yet.</p>}
        </div>
      </section>
    </div>
  );
}

export function CVPostPage(props) {
  return <ProfilePage {...props} />;
}

export function ProfilePage({ onNavigate }) {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    currentRole: "",
    skills: "",
    summary: "",
    expectedSalary: "",
  });
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isAuthenticated) return;

    fetchCv()
      .then((data) => {
        if (data) {
          setProfile({
            fullName: data.fullName || user?.name || "",
            email: data.email || user?.email || "",
            phone: data.phone || "",
            currentRole: data.currentRole || "",
            skills: data.skills || "",
            summary: data.summary || "",
            expectedSalary: data.expectedSalary || "",
          });
        } else {
          setProfile((current) => ({
            ...current,
            fullName: user?.name || "",
            email: user?.email || "",
          }));
        }
      })
      .catch((error) => setMessage(error.message));

    fetchMyApplications()
      .then(setApplications)
      .catch(() => setApplications([]));
  }, [isAuthenticated, user]);

  if (!isAuthenticated) return <AuthPrompt onNavigate={onNavigate} title="Login to view your profile" />;

  const setField = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      await saveCv(profile);
      setMessage("Profile saved.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleWithdraw = async (id) => {
    await deleteApplication(id);
    setApplications(await fetchMyApplications());
  };

  return (
    <div className="workspace-page workspace-page--split">
      <section className="workspace-card">
        <p className="eyebrow">Candidate profile</p>
        <h1>{user?.name}</h1>
        <p>Keep your profile ready so applications feel complete and trustworthy.</p>
        <form className="job-form" onSubmit={handleSave}>
          <label>
            Full name
            <input value={profile.fullName} onChange={(event) => setField("fullName", event.target.value)} />
          </label>
          <label>
            Email
            <input value={profile.email} onChange={(event) => setField("email", event.target.value)} />
          </label>
          <label>
            Phone
            <input value={profile.phone} onChange={(event) => setField("phone", event.target.value)} />
          </label>
          <label>
            Current role
            <input value={profile.currentRole} onChange={(event) => setField("currentRole", event.target.value)} />
          </label>
          <label>
            Expected salary
            <input value={profile.expectedSalary} onChange={(event) => setField("expectedSalary", event.target.value)} />
          </label>
          <label className="job-form__wide">
            Skills
            <input value={profile.skills} onChange={(event) => setField("skills", event.target.value)} />
          </label>
          <label className="job-form__wide">
            Summary
            <textarea value={profile.summary} onChange={(event) => setField("summary", event.target.value)} rows="5" />
          </label>
          <button className="btn btn--primary job-form__wide" type="submit">
            Save profile
          </button>
        </form>
        {message && <p className="form-message">{message}</p>}
      </section>

      <section className="workspace-card">
        <p className="eyebrow">Applications</p>
        <h2>Your application tracker</h2>
        <div className="table-list">
          {applications.map((application) => (
            <div className="table-row" key={application.id}>
              <div>
                <strong>{application.jobTitle}</strong>
                <small>{application.company}  -  {application.status}</small>
              </div>
              <button className="btn btn--danger" type="button" onClick={() => handleWithdraw(application.id)}>
                Withdraw
              </button>
            </div>
          ))}
          {applications.length === 0 && <p className="empty-copy">No applications submitted yet.</p>}
        </div>
      </section>
    </div>
  );
}

export default InfoPage;
