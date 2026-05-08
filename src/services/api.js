// src/services/api.js

const API_BASE_URL = "https://remotive.com/api/remote-jobs";
const DEFAULT_TIMEOUT = 12000;

const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      searchParams.append(key, value);
    }
  });
  return searchParams.toString();
};

const createTimeoutController = (timeout = DEFAULT_TIMEOUT) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  return { controller, timeoutId };
};

const normalizeJob = (job) => ({
  id:              job.id,
  title:           job.title            || "Untitled Job",
  company:         job.company_name     || "Unknown Company",
  companyLogo:     job.company_logo     || "",
  category:        job.category         || "General",
  jobType:         job.job_type         || "Full-time",
  location:        job.candidate_required_location || "Remote",
  salary:          job.salary           || "",
  description:     job.description      || "",
  publicationDate: job.publication_date || "",
  url:             job.url              || "#",
  tags:            Array.isArray(job.tags) ? job.tags : [],
  source:          "Remotive",
  featured:        false,
});

export const fetchJobs = async ({
  search = "", category = "", limit = 40, timeout = DEFAULT_TIMEOUT,
} = {}) => {
  const { controller, timeoutId } = createTimeoutController(timeout);
  try {
    const qs  = buildQueryString({ search, category, limit });
    const url = qs ? `${API_BASE_URL}?${qs}` : API_BASE_URL;
    const res = await fetch(url, {
      method: "GET", signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`Server returned ${res.status}.`);
    const data = await res.json();
    if (!data || !Array.isArray(data.jobs)) throw new Error("Invalid API response format.");
    return data.jobs.map(normalizeJob);
  } catch (err) {
    if (err.name === "AbortError")
      throw new Error("Request timed out. Please check your internet connection.");
    throw new Error(err.message || "Something went wrong while fetching jobs.");
  } finally {
    clearTimeout(timeoutId);
  }
};

export const getJobCategories = (jobs = []) => {
  const cats = jobs.map((j) => j.category).filter(Boolean);
  return ["All", ...new Set(cats)];
};

export const filterJobs = (
  jobs = [],
  { searchTerm = "", category = "All", filterType = "" } = {}
) => {
  const q = searchTerm.trim().toLowerCase();
  return jobs.filter((job) => {
    const matchSearch =
      !q ||
      job.title.toLowerCase().includes(q)    ||
      job.company.toLowerCase().includes(q)  ||
      job.location.toLowerCase().includes(q) ||
      job.category.toLowerCase().includes(q) ||
      job.tags.some((t) => t.toLowerCase().includes(q));
    const matchCat  = category === "All" || job.category === category;
    const matchType = !filterType ||
      (job.jobType || "").toLowerCase().includes(filterType.toLowerCase());
    return matchSearch && matchCat && matchType;
  });
};

// ── Demo data shown when API is unreachable ──────────────────────────────────
export const DEMO_JOBS = [
  {
    id: 1, featured: true,
    title: "Frontend Developer",
    company: "HireFlow",        companyLogo: "",
    category: "software-dev",  jobType: "Full-time",
    location: "Nairobi, Kenya", salary: "KES 80,000 – 120,000",
    postedAt: "Today",
    description: "Build responsive, accessible user interfaces for candidates and hiring teams. Own the component library and collaborate with designers to ship pixel-perfect features.",
    tags: ["React", "TypeScript", "CSS", "Figma"],   url: "#",
  },
  {
    id: 2, featured: false,
    title: "Junior UI Engineer",
    company: "Talent Hub",      companyLogo: "",
    category: "software-dev",  jobType: "Contract",
    location: "Remote",         salary: "KES 45,000 – 70,000",
    postedAt: "2 days ago",
    description: "Support the product team by turning job data into clean, reusable React components. Accessibility and mobile-first design are core to this role.",
    tags: ["React", "Responsive UI", "Storybook"],   url: "#",
  },
  {
    id: 3, featured: false,
    title: "Junior Data Scientist",
    company: "Safaricom",       companyLogo: "",
    category: "data",           jobType: "Contract",
    location: "Remote",         salary: "KES 60,000 – 90,000",
    postedAt: "2 days ago",
    description: "Analyze large datasets and surface actionable insights for product and business teams. Work closely with engineering to productionise ML models.",
    tags: ["Python", "Pandas", "SQL", "Jupyter"],    url: "#",
  },
  {
    id: 4, featured: true,
    title: "Backend Engineer",
    company: "M-Pesa Africa",   companyLogo: "",
    category: "software-dev",  jobType: "Full-time",
    location: "Nairobi, Kenya", salary: "KES 100,000 – 150,000",
    postedAt: "Today",
    description: "Design and build highly scalable APIs that power financial products used by millions across Africa. Strong Node.js or Go background preferred.",
    tags: ["Node.js", "PostgreSQL", "REST", "Redis"], url: "#",
  },
  {
    id: 5, featured: false,
    title: "Fullstack Developer",
    company: "Andela",          companyLogo: "",
    category: "software-dev",  jobType: "Full-time",
    location: "Remote",         salary: "KES 120,000 – 180,000",
    postedAt: "3 days ago",
    description: "Join a globally distributed team building enterprise SaaS products. Own features end-to-end — from database schema design to polished React UI.",
    tags: ["React", "Node.js", "TypeScript", "GraphQL"], url: "#",
  },
  {
    id: 6, featured: false,
    title: "Mobile Engineer (React Native)",
    company: "Copia Global",    companyLogo: "",
    category: "mobile",        jobType: "Full-time",
    location: "Nairobi, Kenya", salary: "KES 90,000 – 130,000",
    postedAt: "1 day ago",
    description: "Build the next generation of our mobile commerce app serving underserved communities across East Africa. Offline-first architecture knowledge is a plus.",
    tags: ["React Native", "Redux", "Firebase", "Expo"], url: "#",
  },
  {
    id: 7, featured: false,
    title: "DevOps Engineer",
    company: "Pezesha",         companyLogo: "",
    category: "devops",        jobType: "Contract",
    location: "Remote",         salary: "KES 80,000 – 110,000",
    postedAt: "4 days ago",
    description: "Manage CI/CD pipelines, containerise services with Docker & Kubernetes, and ensure our cloud infrastructure runs reliably at scale on AWS.",
    tags: ["Docker", "Kubernetes", "AWS", "Terraform"], url: "#",
  },
  {
    id: 8, featured: false,
    title: "Python Backend Developer",
    company: "Ajua",            companyLogo: "",
    category: "software-dev",  jobType: "Part-time",
    location: "Nairobi, Kenya", salary: "KES 40,000 – 60,000",
    postedAt: "5 days ago",
    description: "Help build our data ingestion and analytics pipeline using Python microservices. We value clean, well-tested code and a thoughtful approach to architecture.",
    tags: ["Python", "Flask", "Redis", "Celery"],    url: "#",
  },
];