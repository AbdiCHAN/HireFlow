import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import { fetchJobs, fetchJobById } from "./services/api.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 0;

app.use(cors());
app.use(express.json());


// The backend data fetching and normalization lives in `backend/services/api.js`

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/jobs", async (req, res) => {
  try {
    const search = req.query.search ? String(req.query.search).trim() : "";
    const category = req.query.category ? String(req.query.category).trim() : "";
    const limit = req.query.limit ? String(req.query.limit).trim() : "";

    const jobs = await fetchJobs({ search, category, limit: Number(limit) || 40 });

    return res.json({ data: jobs });
  } catch (error) {
    console.error("/api/jobs error:", error);
    return res.status(502).json({
      error: error.message || "Unable to fetch jobs from backend.",
    });
  }
});

app.get("/api/jobs/:id", async (req, res) => {
  try {
    const id = String(req.params.id || "").trim();

    if (!id) {
      return res.status(400).json({ error: "Missing job id." });
    }

    const job = await fetchJobById(id);

    if (!job) {
      return res.status(404).json({ error: "Job not found." });
    }

    return res.json({ data: job });
  } catch (error) {
    console.error("/api/jobs/:id error:", error);
    return res.status(502).json({
      error: error.message || "Unable to fetch job details from backend.",
    });
  }
});

const distPath = path.join(__dirname, "..", "dist");

if (existsSync(distPath)) {
  app.use(express.static(distPath));

  app.use((req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  const addr = server.address();
  const port = addr && typeof addr === "object" ? addr.port : PORT;
  console.log(`Backend server running on http://localhost:${port}`);
});
