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

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  return { controller, timeoutId };
};

const normalizeJob = (job) => {
  return {
    id: job.id,
    title: job.title || "Untitled Job",
    company: job.company_name || "Unknown Company",
    companyLogo: job.company_logo || "",
    category: job.category || "General",
    jobType: job.job_type || "Full-time",
    location: job.candidate_required_location || "Remote",
    salary: job.salary || "Salary not disclosed",
    description: job.description || "",
    publicationDate: job.publication_date || "",
    url: job.url || "#",
    tags: Array.isArray(job.tags) ? job.tags : [],
    source: "Remotive",
  };
};

export const fetchJobs = async ({
  search = "",
  category = "",
  limit = 30,
  timeout = DEFAULT_TIMEOUT,
} = {}) => {
  const { controller, timeoutId } = createTimeoutController(timeout);

  try {
    const queryString = buildQueryString({
      search,
      category,
      limit,
    });

    const url = queryString ? `${API_BASE_URL}?${queryString}` : API_BASE_URL;

    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch jobs. Server returned ${response.status}.`);
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.jobs)) {
      throw new Error("Invalid API response format.");
    }

    return data.jobs.map(normalizeJob);
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out. Please check your internet connection.");
    }

    throw new Error(error.message || "Something went wrong while fetching jobs.");
  } finally {
    clearTimeout(timeoutId);
  }
};

export const getJobCategories = (jobs = []) => {
  const categories = jobs
    .map((job) => job.category)
    .filter(Boolean);

  return ["All", ...new Set(categories)];
};

export const filterJobs = (jobs = [], { searchTerm = "", category = "All" } = {}) => {
  const cleanSearch = searchTerm.trim().toLowerCase();

  return jobs.filter((job) => {
    const matchesSearch =
      !cleanSearch ||
      job.title.toLowerCase().includes(cleanSearch) ||
      job.company.toLowerCase().includes(cleanSearch) ||
      job.location.toLowerCase().includes(cleanSearch) ||
      job.category.toLowerCase().includes(cleanSearch) ||
      job.tags.some((tag) => tag.toLowerCase().includes(cleanSearch));

    const matchesCategory =
      category === "All" || job.category === category;

    return matchesSearch && matchesCategory;
  });
};