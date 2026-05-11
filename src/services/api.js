// src/services/api.js

const API_BASE_URL    = "https://remotive.com/api/remote-jobs";
const DEFAULT_TIMEOUT = 12000;

const buildQueryString = (params = {}) => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k,v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== "") sp.append(k,v);
  });
  return sp.toString();
};

const createTimeoutController = (timeout = DEFAULT_TIMEOUT) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  return { controller, timeoutId };
};

/* Strip ALL HTML tags and decode entities */
export const stripHtml = (html = "") => {
  if (!html) return "";
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, " ")
    .trim();
};

/* Map Remotive category → our filter category */
const mapCategory = (cat = "") => {
  const c = cat.toLowerCase();
  if (c.includes("software") || c.includes("engineer") || c.includes("devops") || c.includes("backend") || c.includes("frontend")) return "engineering";
  if (c.includes("design") || c.includes("ux") || c.includes("ui")) return "design";
  if (c.includes("market") || c.includes("seo") || c.includes("content")) return "marketing";
  if (c.includes("data") || c.includes("analytic") || c.includes("ml") || c.includes("ai")) return "digital";
  if (c.includes("manage") || c.includes("product") || c.includes("project")) return "management";
  if (c.includes("finance") || c.includes("account") || c.includes("sales")) return "finance";
  return "development";
};

const normalizeJob = (job) => ({
  id:          job.id,
  title:       job.title          || "Untitled Job",
  company:     job.company_name   || "Unknown Company",
  companyLogo: job.company_logo   || "",
  category:    mapCategory(job.category),
  rawCategory: job.category       || "General",
  jobType:     (job.job_type      || "full_time").toLowerCase().replace(/_/g,"-").replace("full-time","full-time"),
  location:    job.candidate_required_location || "Remote",
  salary:      job.salary         || "",
  description: stripHtml(job.description || "").slice(0, 260) + (stripHtml(job.description||"").length > 260 ? "…" : ""),
  fullDescription: stripHtml(job.description || ""),
  url:         job.url            || "#",
  tags:        Array.isArray(job.tags) ? job.tags.slice(0,5) : [],
  postedAt:    job.publication_date ? new Date(job.publication_date).toLocaleDateString("en-US",{month:"short",day:"numeric"}) : "Recently",
  source:      "Remotive",
  featured:    false,
});

export const fetchJobs = async ({
  search="", category="", limit=40, timeout=DEFAULT_TIMEOUT
}={}) => {
  const { controller, timeoutId } = createTimeoutController(timeout);
  try {
    const qs  = buildQueryString({ search, category, limit });
    const url = qs ? `${API_BASE_URL}?${qs}` : API_BASE_URL;
    const res = await fetch(url,{method:"GET",signal:controller.signal,headers:{Accept:"application/json"}});
    if (!res.ok) throw new Error(`Server responded with ${res.status}.`);
    const data = await res.json();
    if (!data || !Array.isArray(data.jobs)) throw new Error("Invalid API response.");
    return data.jobs.map(normalizeJob);
  } catch(err) {
    if (err.name === "AbortError") throw new Error("Request timed out. Check your internet connection.");
    throw new Error(err.message || "Failed to fetch jobs.");
  } finally {
    clearTimeout(timeoutId);
  }
};

export const filterJobs = (jobs=[], {searchTerm="", category="All", filterType=""}={}) => {
  const q = searchTerm.trim().toLowerCase();
  return jobs.filter(job => {
    const matchSearch = !q ||
      job.title.toLowerCase().includes(q)       ||
      job.company.toLowerCase().includes(q)     ||
      job.location.toLowerCase().includes(q)    ||
      job.rawCategory.toLowerCase().includes(q) ||
      job.tags.some(t => t.toLowerCase().includes(q));
    const matchCat  = category === "All" || job.category === category;
    const matchType = !filterType || normalizeType(job.jobType) === filterType;
    return matchSearch && matchCat && matchType;
  });
};

export const normalizeType = (t="") => {
  const s = t.toLowerCase().replace(/[_\s-]/g,"");
  if (s.includes("fulltime") || s==="full") return "full-time";
  if (s.includes("contract"))              return "contract";
  if (s.includes("parttime") || s==="part") return "part-time";
  if (s.includes("freelance"))             return "freelance";
  if (s.includes("remote"))               return "remote";
  return s;
};

/* ─── DEMO JOBS with clean, role-relevant descriptions ─── */
export const DEMO_JOBS = [
  {
    id:1, title:"Frontend Developer", company:"HireFlow",
    companyLogo:"", category:"engineering", rawCategory:"software-dev",
    jobType:"full-time", location:"Nairobi, Kenya", salary:"KES 80k–120k",
    postedAt:"Today",
    description:"Build responsive, pixel-perfect interfaces using React and TypeScript. You'll own the component library, collaborate with designers in Figma, and ship features that thousands of job seekers interact with daily.",
    fullDescription:"Build responsive, pixel-perfect interfaces using React and TypeScript. You'll own the component library, collaborate with designers in Figma, and ship features that thousands of job seekers interact with daily. Strong knowledge of CSS, accessibility standards, and performance optimisation is expected.",
    tags:["React","TypeScript","CSS","Figma"], url:"#", featured:true,
  },
  {
    id:2, title:"Backend Engineer", company:"M-Pesa Africa",
    companyLogo:"", category:"engineering", rawCategory:"software-dev",
    jobType:"full-time", location:"Nairobi, Kenya", salary:"KES 100k–150k",
    postedAt:"Today",
    description:"Design and build high-throughput REST and GraphQL APIs that process millions of financial transactions daily across Africa. You'll work on distributed systems, ensure 99.99% uptime, and mentor junior engineers.",
    fullDescription:"Design and build high-throughput REST and GraphQL APIs that process millions of financial transactions daily across Africa. You'll work on distributed systems, ensure 99.99% uptime, and mentor junior engineers. Node.js or Go experience required. PostgreSQL and Redis proficiency is a strong plus.",
    tags:["Node.js","PostgreSQL","Redis","AWS"], url:"#", featured:true,
  },
  {
    id:3, title:"UX/UI Designer", company:"Andela",
    companyLogo:"", category:"design", rawCategory:"design",
    jobType:"full-time", location:"Remote", salary:"$55k–$80k",
    postedAt:"1 day ago",
    description:"Translate user research and business requirements into elegant, intuitive product experiences. You'll run usability tests, create wireframes and high-fidelity prototypes in Figma, and present design decisions to stakeholders.",
    fullDescription:"Translate user research and business requirements into elegant, intuitive product experiences. You'll run usability tests, create wireframes and high-fidelity prototypes in Figma, and present design decisions to stakeholders. A strong portfolio of shipped product work is required.",
    tags:["Figma","User Research","Prototyping","Accessibility"], url:"#", featured:false,
  },
  {
    id:4, title:"Data Analyst", company:"Safaricom",
    companyLogo:"", category:"digital", rawCategory:"data",
    jobType:"full-time", location:"Nairobi, Kenya", salary:"KES 70k–100k",
    postedAt:"2 days ago",
    description:"Analyse customer behaviour, network performance, and revenue data to surface actionable insights. You'll build dashboards in Tableau, write complex SQL queries, and present findings to senior leadership weekly.",
    fullDescription:"Analyse customer behaviour, network performance, and revenue data to surface actionable insights. You'll build dashboards in Tableau, write complex SQL queries, and present findings to senior leadership weekly. Python scripting for data wrangling is a plus.",
    tags:["SQL","Python","Tableau","Excel"], url:"#", featured:false,
  },
  {
    id:5, title:"Digital Marketing Manager", company:"Jumia",
    companyLogo:"", category:"marketing", rawCategory:"marketing",
    jobType:"full-time", location:"Lagos, Nigeria", salary:"$40k–$60k",
    postedAt:"2 days ago",
    description:"Lead all digital marketing channels including paid social, SEO, email campaigns, and influencer partnerships. You'll set KPIs, manage a team of 4 specialists, and own a $2M annual marketing budget.",
    fullDescription:"Lead all digital marketing channels including paid social, SEO, email campaigns, and influencer partnerships. You'll set KPIs, manage a team of 4 specialists, and own a $2M annual marketing budget. Experience with Google Ads and Meta Business Suite is required.",
    tags:["SEO","Google Ads","Meta","Analytics"], url:"#", featured:false,
  },
  {
    id:6, title:"Mobile Engineer (React Native)", company:"Copia Global",
    companyLogo:"", category:"engineering", rawCategory:"mobile",
    jobType:"full-time", location:"Nairobi, Kenya", salary:"KES 90k–130k",
    postedAt:"1 day ago",
    description:"Build offline-first mobile features for our commerce app serving underserved communities across East Africa. You'll work with Redux, Firebase, and Expo, and write automated tests with Detox.",
    fullDescription:"Build offline-first mobile features for our commerce app serving underserved communities across East Africa. You'll work with Redux, Firebase, and Expo, and write automated tests with Detox. 2+ years of React Native experience required.",
    tags:["React Native","Redux","Firebase","Expo"], url:"#", featured:false,
  },
  {
    id:7, title:"DevOps Engineer", company:"Pezesha",
    companyLogo:"", category:"engineering", rawCategory:"devops",
    jobType:"contract", location:"Remote", salary:"KES 80k–110k",
    postedAt:"3 days ago",
    description:"Own our CI/CD pipelines, containerise microservices with Docker and Kubernetes, and manage infrastructure-as-code on AWS using Terraform. You'll also drive the team's incident response and on-call rotation.",
    fullDescription:"Own our CI/CD pipelines, containerise microservices with Docker and Kubernetes, and manage infrastructure-as-code on AWS using Terraform. You'll also drive the team's incident response and on-call rotation. AWS Solutions Architect certification is a bonus.",
    tags:["Docker","Kubernetes","AWS","Terraform"], url:"#", featured:false,
  },
  {
    id:8, title:"Product Manager", company:"Flutterwave",
    companyLogo:"", category:"management", rawCategory:"product",
    jobType:"full-time", location:"Remote", salary:"$70k–$100k",
    postedAt:"3 days ago",
    description:"Define and execute the roadmap for our payments API product used by 900,000+ businesses. You'll work cross-functionally with engineering, design, and sales to prioritise features, write PRDs, and measure impact.",
    fullDescription:"Define and execute the roadmap for our payments API product used by 900,000+ businesses. You'll work cross-functionally with engineering, design, and sales to prioritise features, write PRDs, and measure impact. Previous fintech or API product experience strongly preferred.",
    tags:["Product Strategy","Roadmap","API","Fintech"], url:"#", featured:false,
  },
  {
    id:9, title:"Financial Analyst", company:"Equity Bank",
    companyLogo:"", category:"finance", rawCategory:"finance",
    jobType:"full-time", location:"Nairobi, Kenya", salary:"KES 65k–90k",
    postedAt:"4 days ago",
    description:"Prepare monthly financial models, variance analyses, and budget forecasts for the retail banking division. You'll support senior management with ad-hoc analysis and present results in board-ready presentations.",
    fullDescription:"Prepare monthly financial models, variance analyses, and budget forecasts for the retail banking division. You'll support senior management with ad-hoc analysis and present results in board-ready presentations. CPA or CFA progress is an advantage.",
    tags:["Excel","Financial Modelling","Accounting","PowerPoint"], url:"#", featured:false,
  },
  {
    id:10, title:"Content Strategist", company:"Talent Hub",
    companyLogo:"", category:"marketing", rawCategory:"content",
    jobType:"part-time", location:"Remote", salary:"KES 45k–70k",
    postedAt:"2 days ago",
    description:"Develop editorial calendars, write long-form SEO articles, and manage freelance writers to produce content that drives 200k+ monthly organic visitors. Deep understanding of keyword research and content funnels required.",
    fullDescription:"Develop editorial calendars, write long-form SEO articles, and manage freelance writers to produce content that drives 200k+ monthly organic visitors. Deep understanding of keyword research and content funnels required. Experience with WordPress and Ahrefs preferred.",
    tags:["SEO","Content Writing","Ahrefs","WordPress"], url:"#", featured:false,
  },
  {
    id:11, title:"Brand Designer", company:"Colored",
    companyLogo:"", category:"design", rawCategory:"design",
    jobType:"freelance", location:"Remote", salary:"$35–$60/hr",
    postedAt:"5 days ago",
    description:"Create cohesive visual identities for early-stage startups: logos, colour systems, typography, and brand guidelines. You'll present concepts, incorporate feedback, and deliver production-ready assets.",
    fullDescription:"Create cohesive visual identities for early-stage startups: logos, colour systems, typography, and brand guidelines. You'll present concepts, incorporate feedback, and deliver production-ready assets. Strong portfolio of branding projects required.",
    tags:["Branding","Illustrator","Figma","Typography"], url:"#", featured:false,
  },
  {
    id:12, title:"Python Backend Developer", company:"Ajua",
    companyLogo:"", category:"development", rawCategory:"software-dev",
    jobType:"part-time", location:"Nairobi, Kenya", salary:"KES 40k–60k",
    postedAt:"5 days ago",
    description:"Build and maintain data ingestion microservices using Flask and Celery. You'll write unit tests with Pytest, review pull requests, and improve pipeline reliability to reduce processing errors by 30%.",
    fullDescription:"Build and maintain data ingestion microservices using Flask and Celery. You'll write unit tests with Pytest, review pull requests, and improve pipeline reliability to reduce processing errors by 30%. 1–2 years Python experience required.",
    tags:["Python","Flask","Celery","Redis"], url:"#", featured:false,
  },
];

/* Colour palette for logo initials */
export const LOGO_COLORS = [
  {bg:"#1C233A",color:"#7C8CFF"},{bg:"#1A2A20",color:"#34D399"},
  {bg:"#2A1A2A",color:"#C084FC"},{bg:"#2A2218",color:"#FCD34D"},
  {bg:"#1A1F2A",color:"#67E8F9"},{bg:"#2A1A1A",color:"#FB7185"},
  {bg:"#182028",color:"#38BDF8"},{bg:"#201C28",color:"#A78BFA"},
];