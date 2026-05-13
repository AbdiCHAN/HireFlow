import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync, mkdirSync } from "fs";
import dotenv from "dotenv";
import { connectDB, initializeDB } from "./src/config/database.ts";
import { setUserModel } from "./src/routes/auth.ts";
import { setJobModel } from "./src/routes/jobs.ts";
import { setCVModel } from "./src/routes/cv.ts";
import { setApplicationModels } from "./src/routes/applications.ts";
import { setAdminModels } from "./src/routes/admin.ts";
import authRoutes from "./src/routes/auth.ts";
import jobRoutes from "./src/routes/jobs.ts";
import cvRoutes from "./src/routes/cv.ts";
import applicationRoutes from "./src/routes/applications.ts";
import adminRoutes from "./src/routes/admin.ts";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

// Initialize database
const startServer = async () => {
  try {
    const db = await connectDB();
    await initializeDB(db);

    // Set up models with database instance
    setUserModel(db);
    setJobModel(db);
    setCVModel(db);
    setApplicationModels(db);
    setAdminModels(db);

    // Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/jobs", jobRoutes);
    app.use("/api/cv", cvRoutes);
    app.use("/api/applications", applicationRoutes);
    app.use("/api/admin", adminRoutes);

    // Health check
    app.get("/health", (req, res) => {
      res.json({ status: "ok" });
    });

    // Serve frontend in production
    const distPath = path.join(__dirname, "..", "dist");
    if (existsSync(distPath)) {
      app.use(express.static(distPath));

      app.use((req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    const server = app.listen(PORT, () => {
      const addr = server.address();
      const port = addr && typeof addr === "object" ? addr.port : PORT;
      console.log(`Backend server running on http://localhost:${port}`);
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      console.log("Shutting down gracefully...");
      await db.close();
      server.close(() => {
        console.log("Process terminated");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
