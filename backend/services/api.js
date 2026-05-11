// src/services/api.js

const REMOTIVE_API_URL = "https://remotive.com/api/remote-jobs";
const DEFAULT_TIMEOUT = 12000;

// If you add VITE_API_BASE_URL in .env, it will use that.
// Otherwise, it safely uses the public Remotive API directly.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || REMOTIVE_API_URL;

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
  const timeoutId = window.setTimeout(() => controller.abort(), timeout);

  return { controller, timeoutId };
};

const safeText = (value, fallback = "") => {
  if (value === undefined || value === null) return fallback;
  return String(value);
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
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&rdquo;/g, "”")
    .replace(/&ldquo;/g, "“")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
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
  const tags = Array.isArray(job.tags) ? job.tags.slice(0, 5) : [];

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

    category:
      job.category && !job.rawCategory
        ? mapCategory(job.category, title, tags)
        : job.category || mapCategory(job.rawCategory, title, tags),

    rawCategory: safeText(job.rawCategory || job.category, "General"),
    jobType: normalizeType(job.jobType || job.job_type || "remote"),

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
    url: safeText(job.url, "#"),
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

const fetchFromUrl = async (url, timeout) => {
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

export const fetchJobs = async ({
  search = "",
  category = "",
  limit = 40,
  timeout = DEFAULT_TIMEOUT,
} = {}) => {
  const primaryUrl = buildJobsUrl({
    baseUrl: API_BASE_URL,
    search,
    category,
    limit,
  });

  const fallbackUrl = buildJobsUrl({
    baseUrl: REMOTIVE_API_URL,
    search,
    category,
    limit,
  });

  try {
    let data;

    try {
      data = await fetchFromUrl(primaryUrl, timeout);
    } catch (primaryError) {
      // If your local /api/jobs route is missing, this fallback keeps the app working.
      if (API_BASE_URL !== REMOTIVE_API_URL) {
        data = await fetchFromUrl(fallbackUrl, timeout);
      } else {
        throw primaryError;
      }
    }

    const jobs = getJobsArrayFromResponse(data)
      .map(normalizeJob)
      .filter((job) => job.title && job.company)
      .slice(0, Number(limit) || 40);

    if (jobs.length === 0) {
      return DEMO_JOBS.slice(0, Number(limit) || 40);
    }

    return jobs;
  } catch (err) {
    if (err?.name === "AbortError") {
      throw new Error("Request timed out. Check your internet connection.", {
        cause: err,
      });
    }

    throw new Error(err?.message || "Failed to fetch jobs.", {
      cause: err,
    });
  }
};

export const filterJobs = (
  jobs = [],
  { searchTerm = "", category = "All", filterType = "" } = {}
) => {
  const query = safeText(searchTerm).trim().toLowerCase();
  const selectedCategory = safeText(category, "All").toLowerCase();
  const selectedType = normalizeType(filterType);

  return jobs.filter((job = {}) => {
    const title = safeText(job.title).toLowerCase();
    const company = safeText(job.company).toLowerCase();
    const location = safeText(job.location).toLowerCase();
    const rawCategory = safeText(job.rawCategory).toLowerCase();
    const jobCategory = safeText(job.category).toLowerCase();
    const jobType = normalizeType(job.jobType);
    const description = safeText(job.description).toLowerCase();
    const tags = Array.isArray(job.tags) ? job.tags : [];

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
      jobType === selectedType ||
      (selectedType === "remote" && location.includes("remote"));

    return matchesSearch && matchesCategory && matchesType;
  });
};

/* DEMO JOBS */
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
    salary: "KES 80k–120k",
    postedAt: "Today",
    description:
      "Build responsive, pixel-perfect interfaces using React and TypeScript. You'll own the component library, collaborate with designers in Figma, and ship features that thousands of job seekers interact with daily.",
    fullDescription:
      "Build responsive, pixel-perfect interfaces using React and TypeScript. You'll own the component library, collaborate with designers in Figma, and ship features that thousands of job seekers interact with daily. Strong knowledge of CSS, accessibility standards, and performance optimisation is expected.",
    tags: ["React", "TypeScript", "CSS", "Figma"],
    url: "#",
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
    salary: "KES 100k–150k",
    postedAt: "Today",
    description:
      "Design and build high-throughput REST and GraphQL APIs that process millions of financial transactions daily across Africa.",
    fullDescription:
      "Design and build high-throughput REST and GraphQL APIs that process millions of financial transactions daily across Africa. You'll work on distributed systems, ensure 99.99% uptime, and mentor junior engineers.",
    tags: ["Node.js", "PostgreSQL", "Redis", "AWS"],
    url: "#",
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
    salary: "$55k–$80k",
    postedAt: "1 day ago",
    description:
      "Translate user research and business requirements into elegant, intuitive product experiences using Figma and usability testing.",
    fullDescription:
      "Translate user research and business requirements into elegant, intuitive product experiences. You'll run usability tests, create wireframes and high-fidelity prototypes in Figma, and present design decisions to stakeholders.",
    tags: ["Figma", "User Research", "Prototyping", "Accessibility"],
    url: "#",
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
    salary: "KES 70k–100k",
    postedAt: "2 days ago",
    description:
      "Analyse customer behaviour, network performance, and revenue data to surface actionable insights with SQL and dashboards.",
    fullDescription:
      "Analyse customer behaviour, network performance, and revenue data to surface actionable insights. You'll build dashboards in Tableau, write complex SQL queries, and present findings to senior leadership weekly.",
    tags: ["SQL", "Python", "Tableau", "Excel"],
    url: "#",
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
    salary: "$40k–$60k",
    postedAt: "2 days ago",
    description:
      "Lead digital marketing channels including paid social, SEO, email campaigns, and influencer partnerships.",
    fullDescription:
      "Lead all digital marketing channels including paid social, SEO, email campaigns, and influencer partnerships. You'll set KPIs, manage a team of specialists, and own performance marketing growth.",
    tags: ["SEO", "Google Ads", "Meta", "Analytics"],
    url: "#",
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
    salary: "KES 90k–130k",
    postedAt: "1 day ago",
    description:
      "Build offline-first mobile features for a commerce app serving underserved communities across East Africa.",
    fullDescription:
      "Build offline-first mobile features for our commerce app serving underserved communities across East Africa. You'll work with Redux, Firebase, Expo, and automated testing.",
    tags: ["React Native", "Redux", "Firebase", "Expo"],
    url: "#",
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
    salary: "KES 80k–110k",
    postedAt: "3 days ago",
    description:
      "Own CI/CD pipelines, containerise microservices with Docker and Kubernetes, and manage infrastructure on AWS.",
    fullDescription:
      "Own our CI/CD pipelines, containerise microservices with Docker and Kubernetes, and manage infrastructure-as-code on AWS using Terraform.",
    tags: ["Docker", "Kubernetes", "AWS", "Terraform"],
    url: "#",
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
    salary: "$70k–$100k",
    postedAt: "3 days ago",
    description:
      "Define and execute the roadmap for a payments API product used by businesses across Africa.",
    fullDescription:
      "Define and execute the roadmap for our payments API product. You'll work cross-functionally with engineering, design, and sales to prioritise features and measure impact.",
    tags: ["Product Strategy", "Roadmap", "API", "Fintech"],
    url: "#",
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
    salary: "KES 65k–90k",
    postedAt: "4 days ago",
    description:
      "Prepare financial models, variance analyses, and budget forecasts for retail banking teams.",
    fullDescription:
      "Prepare monthly financial models, variance analyses, and budget forecasts for the retail banking division. You'll support senior management with ad-hoc analysis and presentations.",
    tags: ["Excel", "Financial Modelling", "Accounting", "PowerPoint"],
    url: "#",
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
    salary: "KES 45k–70k",
    postedAt: "2 days ago",
    description:
      "Develop editorial calendars, write SEO articles, and manage freelance writers to grow organic traffic.",
    fullDescription:
      "Develop editorial calendars, write long-form SEO articles, and manage freelance writers to produce content that drives organic visitors.",
    tags: ["SEO", "Content Writing", "Ahrefs", "WordPress"],
    url: "#",
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
    salary: "$35–$60/hr",
    postedAt: "5 days ago",
    description:
      "Create cohesive visual identities for startups, including logos, colour systems, typography, and guidelines.",
    fullDescription:
      "Create cohesive visual identities for early-stage startups: logos, colour systems, typography, and brand guidelines.",
    tags: ["Branding", "Illustrator", "Figma", "Typography"],
    url: "#",
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
    salary: "KES 40k–60k",
    postedAt: "5 days ago",
    description:
      "Build and maintain data ingestion microservices using Flask, Celery, Redis, and Pytest.",
    fullDescription:
      "Build and maintain data ingestion microservices using Flask and Celery. You'll write unit tests with Pytest and improve pipeline reliability.",
    tags: ["Python", "Flask", "Celery", "Redis"],
    url: "#",
    featured: false,
  },
];

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