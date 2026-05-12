const REMOTIVE_API_URL = process.env.REMOTIVE_API_URL || "https://remotive.com/api/remote-jobs";

const safeText = (value, fallback = "") => {
  if (value === undefined || value === null) return fallback;
  return String(value);
};

const stripHtml = (html = "") => {
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

const normalizeType = (type = "") => {
  const value = safeText(type).toLowerCase().replace(/[_\s-]/g, "");

  if (value.includes("fulltime") || value === "full") return "full-time";
  if (value.includes("contract")) return "contract";
  if (value.includes("parttime") || value === "part") return "part-time";
  if (value.includes("freelance")) return "freelance";
  if (value.includes("remote")) return "remote";

  return value || "remote";
};

const mapCategory = (category = "", title = "", tags = []) => {
  if (!category) return "General";
  return safeText(category);
};

const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toDateString();
};

const normalizeJob = (job = {}) => {
  const fullDescription = stripHtml(
    job.fullDescription || job.description || job.description_text || ""
  );

  const title = safeText(job.title, "Untitled Job");
  const company = safeText(job.company || job.company_name, "Unknown Company");
  const tags = Array.isArray(job.tags) ? job.tags.slice(0, 5) : [];
  const rawCategory = safeText(job.raw_category || job.category || job.rawCategory, "General");

  const id =
    job.id ??
    `${company}-${title}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  return {
    id,
    title,
    company,
    companyLogo: safeText(job.company_logo || job.companyLogo || ""),
    category: job.category || rawCategory,
    rawCategory,
    jobType: normalizeType(job.job_type || job.jobType || job.type || "remote"),
    location: safeText(job.candidate_required_location || job.location || "Remote"),
    salary: safeText(job.salary, ""),
    description: fullDescription.length > 260 ? `${fullDescription.slice(0,260)}...` : fullDescription || "No description available yet.",
    fullDescription: fullDescription || "No description available yet.",
    url: safeText(job.url || job.job_url || ""),
    applicationUrl: safeText(job.application_url || job.applicationUrl || ""),
    applyUrl: safeText(job.apply_url || job.applyUrl || ""),
    tags,
    postedAt: job.postedAt || formatDate(job.publication_date) || job.publication_date,
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

const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.append("search", String(params.search));
  if (params.category && params.category !== "All") searchParams.append("category", String(params.category));
  if (params.limit) searchParams.append("limit", String(params.limit));

  return searchParams.toString() ? `?${searchParams.toString()}` : "";
};

export const fetchJobs = async ({ search = "", category = "", limit = 40 } = {}) => {
  const qs = buildQueryString({ search, category, limit });
  const url = `${REMOTIVE_API_URL}${qs}`;

  const resp = await fetch(url, { headers: { Accept: "application/json" } });
  if (!resp.ok) throw new Error(`Remote API responded ${resp.status}`);
  const data = await resp.json();

  const jobs = getJobsArrayFromResponse(data).map(normalizeJob).slice(0, Number(limit) || 40);
  return jobs;
};

export const fetchJobById = async (id) => {
  if (!id) return null;
  const jobs = await fetchJobs({ limit: 500 });
  return jobs.find((j) => String(j.id) === String(id)) || null;
};
