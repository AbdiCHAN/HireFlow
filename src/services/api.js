const REMOTIVE_API_URL = "https://remotive.com/api/remote-jobs";
const DEFAULT_TIMEOUT = 12000;

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(
  /\/$/,
  ""
);

export const TOKEN_KEY = "authToken";
export const USER_KEY = "authUser";

export const apiUrl = (path = "") => {
  const safePath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${safePath}`;
};

export const getAuthToken = () => {
  return (
    localStorage.getItem(TOKEN_KEY) ||
    localStorage.getItem("hireflow_auth_token")
  );
};

export const authHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const safeText = (value, fallback = "") => {
  if (value === undefined || value === null) return fallback;
  return String(value);
};

const isValidUrl = (url = "") => {
  const value = safeText(url).trim();

  return (
    value &&
    value !== "#" &&
    value !== "/" &&
    value.toLowerCase() !== "javascript:void(0)"
  );
};

const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      searchParams.append(key, String(value).trim());
    }
  });

  return searchParams.toString();
};

const createTimeoutController = (timeout = DEFAULT_TIMEOUT) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  return { controller, timeoutId };
};

export const stripHtml = (html = "") => {
  return safeText(html)
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&mdash;/g, "--")
    .replace(/&ndash;/g, "-")
    .replace(/\s{2,}/g, " ")
    .trim();
};

export const normalizeType = (type = "") => {
  const value = safeText(type).toLowerCase().replace(/[_\s-]/g, "");

  if (value.includes("fulltime") || value === "full") return "full-time";
  if (value.includes("contract")) return "contract";
  if (value.includes("parttime") || value === "part") return "part-time";
  if (value.includes("freelance")) return "freelance";
  if (value.includes("remote")) return "remote";

  return value || "remote";
};

export const normalizeTags = (tags = []) => {
  if (Array.isArray(tags)) {
    return tags.map(String).filter(Boolean).slice(0, 8);
  }

  if (typeof tags === "string") {
    const trimmed = tags.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);

      if (Array.isArray(parsed)) {
        return parsed.map(String).filter(Boolean).slice(0, 8);
      }
    } catch {
      // Fall through to comma-separated parsing.
    }

    return trimmed
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 8);
  }

  return [];
};

export const LOGO_COLORS = [
  { bg: "#1C233A", color: "#7C8CFF" },
  { bg: "#1A2A20", color: "#34D399" },
  { bg: "#2A1A2A", color: "#C084FC" },
  { bg: "#2A2218", color: "#FCD34D" },
  { bg: "#1A1F2A", color: "#67E8F9" },
  { bg: "#2A1A1A", color: "#FB7185" },
  { bg: "#182028", color: "#38BDF8" },
  { bg: "#201C28", color: "#A78BFA" },
];

export const DEMO_JOBS = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "HireFlow",
    companyLogo: "",
    category: "engineering",
    rawCategory: "software-dev",
    jobType: "full-time",
    location: "Nairobi, Kenya",
    salary: "KES 80k-120k",
    postedAt: "Today",
    description:
      "Build responsive, pixel-perfect interfaces using React and TypeScript. You'll own the component library, collaborate with designers in Figma, and ship features that thousands of job seekers interact with daily.",
    fullDescription:
      "Build responsive, pixel-perfect interfaces using React and TypeScript. You'll own the component library, collaborate with designers in Figma, and ship features that thousands of job seekers interact with daily. Strong knowledge of CSS, accessibility standards, and performance optimisation is expected.",
    tags: ["React", "TypeScript", "CSS", "Figma"],
    featured: true,
  },
  {
    id: 2,
    title: "Backend Engineer",
    company: "M-Pesa Africa",
    companyLogo: "",
    category: "engineering",
    rawCategory: "software-dev",
    jobType: "full-time",
    location: "Nairobi, Kenya",
    salary: "KES 100k-150k",
    postedAt: "Today",
    description:
      "Design and build high-throughput REST and GraphQL APIs that process millions of financial transactions daily across Africa.",
    fullDescription:
      "Design and build high-throughput REST and GraphQL APIs that process millions of financial transactions daily across Africa. You'll work on distributed systems, ensure high uptime, and mentor junior engineers.",
    tags: ["Node.js", "PostgreSQL", "Redis", "AWS"],
    featured: true,
  },
  {
    id: 3,
    title: "UX/UI Designer",
    company: "Andela",
    companyLogo: "",
    category: "design",
    rawCategory: "design",
    jobType: "full-time",
    location: "Remote",
    salary: "$55k-$80k",
    postedAt: "1 day ago",
    description:
      "Translate user research and business requirements into elegant, intuitive product experiences using Figma and usability testing.",
    fullDescription:
      "Translate user research and business requirements into elegant, intuitive product experiences. You'll run usability tests, create wireframes and high-fidelity prototypes in Figma, and present design decisions to stakeholders.",
    tags: ["Figma", "User Research", "Prototyping", "Accessibility"],
    featured: false,
  },
  {
    id: 4,
    title: "Data Analyst",
    company: "Safaricom",
    companyLogo: "",
    category: "digital",
    rawCategory: "data",
    jobType: "full-time",
    location: "Nairobi, Kenya",
    salary: "KES 70k-100k",
    postedAt: "2 days ago",
    description:
      "Analyse customer behaviour, network performance, and revenue data to surface actionable insights with SQL and dashboards.",
    fullDescription:
      "Analyse customer behaviour, network performance, and revenue data to surface actionable insights. You'll build dashboards in Tableau, write complex SQL queries, and present findings to senior leadership weekly.",
    tags: ["SQL", "Python", "Tableau", "Excel"],
    featured: false,
  },
  {
    id: 5,
    title: "Digital Marketing Manager",
    company: "Jumia",
    companyLogo: "",
    category: "marketing",
    rawCategory: "marketing",
    jobType: "full-time",
    location: "Lagos, Nigeria",
    salary: "$40k-$60k",
    postedAt: "2 days ago",
    description:
      "Lead digital marketing channels including paid social, SEO, email campaigns, and influencer partnerships.",
    fullDescription:
      "Lead all digital marketing channels including paid social, SEO, email campaigns, and influencer partnerships. You'll set KPIs, manage a team of specialists, and own performance marketing growth.",
    tags: ["SEO", "Google Ads", "Meta", "Analytics"],
    featured: false,
  },
  {
    id: 6,
    title: "Mobile Engineer (React Native)",
    company: "Copia Global",
    companyLogo: "",
    category: "engineering",
    rawCategory: "mobile",
    jobType: "full-time",
    location: "Nairobi, Kenya",
    salary: "KES 90k-130k",
    postedAt: "1 day ago",
    description:
      "Build offline-first mobile features for a commerce app serving underserved communities across East Africa.",
    fullDescription:
      "Build offline-first mobile features for our commerce app serving underserved communities across East Africa. You'll work with Redux, Firebase, Expo, and automated testing.",
    tags: ["React Native", "Redux", "Firebase", "Expo"],
    featured: false,
  },
  {
    id: 7,
    title: "DevOps Engineer",
    company: "Pezesha",
    companyLogo: "",
    category: "engineering",
    rawCategory: "devops",
    jobType: "contract",
    location: "Remote",
    salary: "KES 80k-110k",
    postedAt: "3 days ago",
    description:
      "Own CI/CD pipelines, containerise microservices with Docker and Kubernetes, and manage infrastructure on AWS.",
    fullDescription:
      "Own our CI/CD pipelines, containerise microservices with Docker and Kubernetes, and manage infrastructure-as-code on AWS using Terraform.",
    tags: ["Docker", "Kubernetes", "AWS", "Terraform"],
    featured: false,
  },
  {
    id: 8,
    title: "Product Manager",
    company: "Flutterwave",
    companyLogo: "",
    category: "management",
    rawCategory: "product",
    jobType: "full-time",
    location: "Remote",
    salary: "$70k-$100k",
    postedAt: "3 days ago",
    description:
      "Define and execute the roadmap for a payments API product used by businesses across Africa.",
    fullDescription:
      "Define and execute the roadmap for our payments API product. You'll work cross-functionally with engineering, design, and sales to prioritise features and measure impact.",
    tags: ["Product Strategy", "Roadmap", "API", "Fintech"],
    featured: false,
  },
  {
    id: 9,
    title: "Financial Analyst",
    company: "Equity Bank",
    companyLogo: "",
    category: "finance",
    rawCategory: "finance",
    jobType: "full-time",
    location: "Nairobi, Kenya",
    salary: "KES 65k-90k",
    postedAt: "4 days ago",
    description:
      "Prepare financial models, variance analyses, and budget forecasts for retail banking teams.",
    fullDescription:
      "Prepare monthly financial models, variance analyses, and budget forecasts for the retail banking division. You'll support senior management with ad-hoc analysis and presentations.",
    tags: ["Excel", "Financial Modelling", "Accounting", "PowerPoint"],
    featured: false,
  },
  {
    id: 10,
    title: "Content Strategist",
    company: "Talent Hub",
    companyLogo: "",
    category: "marketing",
    rawCategory: "content",
    jobType: "part-time",
    location: "Remote",
    salary: "KES 45k-70k",
    postedAt: "2 days ago",
    description:
      "Develop editorial calendars, write SEO articles, and manage freelance writers to grow organic traffic.",
    fullDescription:
      "Develop editorial calendars, write long-form SEO articles, and manage freelance writers to produce content that drives organic visitors.",
    tags: ["SEO", "Content Writing", "Ahrefs", "WordPress"],
    featured: false,
  },
  {
    id: 11,
    title: "Brand Designer",
    company: "Colored",
    companyLogo: "",
    category: "design",
    rawCategory: "design",
    jobType: "freelance",
    location: "Remote",
    salary: "$35-$60/hr",
    postedAt: "5 days ago",
    description:
      "Create cohesive visual identities for startups, including logos, colour systems, typography, and guidelines.",
    fullDescription:
      "Create cohesive visual identities for early-stage startups: logos, colour systems, typography, and brand guidelines.",
    tags: ["Branding", "Illustrator", "Figma", "Typography"],
    featured: false,
  },
  {
    id: 12,
    title: "Python Backend Developer",
    company: "Ajua",
    companyLogo: "",
    category: "development",
    rawCategory: "software-dev",
    jobType: "part-time",
    location: "Nairobi, Kenya",
    salary: "KES 40k-60k",
    postedAt: "5 days ago",
    description:
      "Build and maintain data ingestion microservices using Flask, Celery, Redis, and Pytest.",
    fullDescription:
      "Build and maintain data ingestion microservices using Flask and Celery. You'll write unit tests with Pytest and improve pipeline reliability.",
    tags: ["Python", "Flask", "Celery", "Redis"],
    featured: false,
  },
];

const mapCategory = (category = "", title = "", tags = []) => {
  const combined = [
    safeText(category),
    safeText(title),
    ...(Array.isArray(tags) ? tags.map(String) : []),
  ]
    .join(" ")
    .toLowerCase();

  if (
    combined.includes("software") ||
    combined.includes("engineer") ||
    combined.includes("developer") ||
    combined.includes("frontend") ||
    combined.includes("backend") ||
    combined.includes("devops") ||
    combined.includes("react") ||
    combined.includes("node") ||
    combined.includes("python")
  ) {
    return "engineering";
  }

  if (
    combined.includes("design") ||
    combined.includes("designer") ||
    combined.includes("ux") ||
    combined.includes("ui") ||
    combined.includes("brand")
  ) {
    return "design";
  }

  if (
    combined.includes("marketing") ||
    combined.includes("seo") ||
    combined.includes("content") ||
    combined.includes("growth") ||
    combined.includes("social")
  ) {
    return "marketing";
  }

  if (
    combined.includes("data") ||
    combined.includes("analytics") ||
    combined.includes("analyst") ||
    combined.includes("machine learning") ||
    combined.includes("ai") ||
    combined.includes("ml")
  ) {
    return "digital";
  }

  if (
    combined.includes("manager") ||
    combined.includes("management") ||
    combined.includes("product") ||
    combined.includes("project") ||
    combined.includes("operations")
  ) {
    return "management";
  }

  if (
    combined.includes("finance") ||
    combined.includes("account") ||
    combined.includes("sales") ||
    combined.includes("business")
  ) {
    return "finance";
  }

  return "development";
};

const formatDate = (dateValue) => {
  if (!dateValue) return "Recently";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const normalizeJob = (job = {}) => {
  const fullDescription = stripHtml(
    job.fullDescription || job.description || job.description_text || ""
  );

  const title = safeText(job.title, "Untitled Job");
  const company = safeText(job.company || job.company_name, "Unknown Company");
  const tags = normalizeTags(job.tags).slice(0, 5);
  const rawCategory = safeText(job.rawCategory || job.category, "General");

  return {
    id:
      job.id ??
      `${company}-${title}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),

    title,
    company,
    companyLogo: safeText(job.companyLogo || job.company_logo, ""),
    category: job.category
      ? mapCategory(job.category, title, tags)
      : mapCategory(rawCategory, title, tags),
    rawCategory,
    jobType: normalizeType(job.jobType || job.job_type || job.type || "remote"),
    location: safeText(
      job.location || job.candidate_required_location,
      "Remote"
    ),
    salary: safeText(job.salary, ""),
    description:
      fullDescription.length > 260
        ? `${fullDescription.slice(0, 260)}...`
        : fullDescription || "No description available yet.",
    fullDescription: fullDescription || "No description available yet.",
    url: isValidUrl(job.url) ? safeText(job.url) : "",
    applicationUrl: isValidUrl(job.applicationUrl)
      ? safeText(job.applicationUrl)
      : "",
    applyUrl: isValidUrl(job.applyUrl) ? safeText(job.applyUrl) : "",
    tags,
    postedAt: job.postedAt || formatDate(job.publication_date),
    source: job.source || "Remotive",
    featured: Boolean(job.featured),
  };
};

const getJobsArrayFromResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.jobs)) return data.jobs;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;

  return [];
};

const fetchFromUrl = async (url, timeout = DEFAULT_TIMEOUT) => {
  const { controller, timeoutId } = createTimeoutController(timeout);

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}.`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
};

export const readApiError = async (response, fallback = "Request failed") => {
  try {
    const data = await response.json();
    return data?.error || data?.message || fallback;
  } catch {
    return fallback;
  }
};

export const apiRequest = async (path, options = {}) => {
  const response = await fetch(apiUrl(path), options);

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return response.json();
};

const buildJobsUrl = ({ baseUrl, search = "", category = "", limit = 40 }) => {
  const isRemotive = baseUrl.includes("remotive.com");

  const params = isRemotive
    ? {
        search,
        category: category && category !== "All" ? category : "",
      }
    : {
        search,
        category: category && category !== "All" ? category : "",
        limit,
      };

  const queryString = buildQueryString(params);

  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

const getJobIdentity = (job = {}) => {
  const external = safeText(job.id).trim();
  if (external) return external.toLowerCase();

  return [job.company, job.title, job.location]
    .map((value) => safeText(value).trim().toLowerCase())
    .filter(Boolean)
    .join("|");
};

const mergeJobs = (jobGroups = [], limit = 40) => {
  const seen = new Set();
  const merged = [];

  jobGroups.flat().forEach((job) => {
    const normalized = normalizeJob(job);
    const key = getJobIdentity(normalized);

    if (!normalized.title || !normalized.company || !key || seen.has(key)) {
      return;
    }

    seen.add(key);
    merged.push(normalized);
  });

  return merged.slice(0, Number(limit) || 40);
};

export const fetchJobs = async ({
  search = "",
  searchTerm = "",
  category = "",
  limit = 40,
  timeout = DEFAULT_TIMEOUT,
} = {}) => {
  const finalSearch = search || searchTerm;

  const urls = [
    buildJobsUrl({
      baseUrl: apiUrl("/api/jobs"),
      search: finalSearch,
      category,
      limit,
    }),
    buildJobsUrl({
      baseUrl: REMOTIVE_API_URL,
      search: finalSearch,
      category,
      limit,
    }),
  ];

  const results = await Promise.allSettled(
    urls.map((url) => fetchFromUrl(url, timeout))
  );

  const jobGroups = results
    .filter((result) => result.status === "fulfilled")
    .map((result) => getJobsArrayFromResponse(result.value));

  const mergedJobs = mergeJobs(jobGroups, limit);

  if (mergedJobs.length > 0) {
    return mergedJobs;
  }

  return DEMO_JOBS.slice(0, Number(limit) || 40);
};

export const fetchApiKeys = async () => {
  const data = await apiRequest("/api/api-keys", {
    headers: authHeaders(),
  });

  return data?.data || [];
};

export const createApiKey = async (name = "HireFlow API Key") => {
  const data = await apiRequest("/api/api-keys", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ name }),
  });

  return data;
};

export const revokeApiKey = async (id) => {
  return apiRequest(`/api/api-keys/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
};

export const toggleApiKey = async (id) => {
  return apiRequest(`/api/api-keys/${id}/toggle`, {
    method: "PATCH",
    headers: authHeaders(),
  });
};

export const createJob = async (payload) => {
  const data = await apiRequest("/api/jobs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return data?.data ? normalizeJob(data.data) : data;
};

export const updateJob = async (id, payload) => {
  const data = await apiRequest(`/api/jobs/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return data?.data ? normalizeJob(data.data) : data;
};

export const deleteJob = async (id) => {
  return apiRequest(`/api/jobs/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
};

export const fetchMyJobs = async () => {
  const data = await apiRequest("/api/jobs/mine", {
    headers: authHeaders(),
  });

  return getJobsArrayFromResponse(data).map(normalizeJob);
};

export const applyToJob = async (jobId, coverLetter = "") => {
  return apiRequest("/api/applications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ jobId, coverLetter }),
  });
};

export const fetchMyApplications = async () => {
  const data = await apiRequest("/api/applications/my", {
    headers: authHeaders(),
  });

  return data?.data || [];
};

export const fetchApplications = async () => {
  const data = await apiRequest("/api/applications", {
    headers: authHeaders(),
  });

  return data?.data || [];
};

export const updateApplicationStatus = async (id, status) => {
  const data = await apiRequest(`/api/applications/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ status }),
  });

  return data?.data;
};

export const deleteApplication = async (id) => {
  return apiRequest(`/api/applications/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
};

export const fetchCv = async () => {
  const data = await apiRequest("/api/cvs/me", {
    headers: authHeaders(),
  });

  return data?.data || null;
};

export const saveCv = async (payload) => {
  const data = await apiRequest("/api/cvs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return data?.data;
};

export const fetchAdminOverview = async () => {
  return apiRequest("/api/admin/overview", {
    headers: authHeaders(),
  });
};

export const filterJobs = (
  jobs = [],
  { searchTerm = "", search = "", category = "All", filterType = "", type = "" } = {}
) => {
  const query = safeText(searchTerm || search).trim().toLowerCase();
  const selectedCategory = safeText(category, "All").toLowerCase();
  const selectedType = normalizeType(filterType || type);

  return jobs.filter((job = {}) => {
    const title = safeText(job.title).toLowerCase();
    const company = safeText(job.company).toLowerCase();
    const location = safeText(job.location).toLowerCase();
    const rawCategory = safeText(job.rawCategory).toLowerCase();
    const jobCategory = safeText(job.category).toLowerCase();
    const jobType = normalizeType(job.jobType || job.type);
    const description = safeText(job.description).toLowerCase();
    const tags = normalizeTags(job.tags);

    const matchesSearch =
      !query ||
      title.includes(query) ||
      company.includes(query) ||
      location.includes(query) ||
      rawCategory.includes(query) ||
      jobCategory.includes(query) ||
      description.includes(query) ||
      tags.some((tag) => safeText(tag).toLowerCase().includes(query));

    const matchesCategory =
      selectedCategory === "all" ||
      jobCategory === selectedCategory ||
      rawCategory === selectedCategory;

    const matchesType =
      !filterType ||
      selectedType === "all" ||
      selectedType === "all-types" ||
      jobType === selectedType ||
      (selectedType === "remote" && location.includes("remote"));

    return matchesSearch && matchesCategory && matchesType;
  });
};

export const getApplyUrl = (job = {}) => {
  if (isValidUrl(job.applyUrl)) return job.applyUrl;
  if (isValidUrl(job.applicationUrl)) return job.applicationUrl;
  if (isValidUrl(job.url)) return job.url;

  const title = encodeURIComponent(job.title || "Job");
  const company = encodeURIComponent(job.company || "HireFlow");

  return `mailto:careers@hireflow.com?subject=Application for ${title} at ${company}`;
};

export const openApplyUrl = (job = {}) => {
  const applyUrl = getApplyUrl(job);

  if (!applyUrl) return;

  window.open(applyUrl, "_blank", "noopener,noreferrer");
};

export const getCategories = (jobs = DEMO_JOBS) => {
  return ["All", ...new Set(jobs.map((job) => job.category).filter(Boolean))];
};

export const getJobTypes = (jobs = DEMO_JOBS) => {
  return [
    "All Types",
    ...new Set(jobs.map((job) => job.jobType || job.type).filter(Boolean)),
  ];
};

export const getJobById = (id, jobs = DEMO_JOBS) => {
  return jobs.find((job) => String(job.id) === String(id)) || null;
};

export const fetchJobById = async (id) => {
  if (!id) return null;

  const demoJob = getJobById(id);

  try {
    const data = await fetchFromUrl(apiUrl(`/api/jobs/${id}`));

    if (data?.data) {
      return normalizeJob(data.data);
    }
  } catch {
    // Fall back below.
  }

  return demoJob;
};

export const fetchCategories = async () => {
  return getCategories();
};

export const fetchJobTypes = async () => {
  return getJobTypes();
};
