#!/usr/bin/env node
import { createServer as createNetServer } from "net";
import { spawn } from "child_process";

const findFreePort = () =>
  new Promise((resolve, reject) => {
    const srv = createNetServer();
    srv.once("error", reject);
    srv.once("listening", () => {
      const port = srv.address().port;
      srv.close(() => resolve(port));
    });
    srv.listen(0, "127.0.0.1");
  });

const run = async () => {
  try {
    const backendPort = process.env.BACKEND_PORT
      ? Number(process.env.BACKEND_PORT)
      : await findFreePort();

    console.log(`Starting backend on port ${backendPort}`);

    const serverEnv = { ...process.env, PORT: String(backendPort) };

    const backend = spawn("node", ["backend/server.js"], {
      env: serverEnv,
      stdio: "inherit",
    });

    // wait for backend /health to be available
    const healthUrl = `http://127.0.0.1:${backendPort}/health`;

    const waitForHealth = async (retries = 20, delay = 250) => {
      for (let i = 0; i < retries; i++) {
        try {
          const controller = new AbortController();
          const id = setTimeout(() => controller.abort(), 2000);
          const res = await fetch(healthUrl, { signal: controller.signal });
          clearTimeout(id);
          if (res.ok) return true;
        } catch (e) {
          // ignore and retry
        }
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, delay));
      }
      return false;
    };

    const healthy = await waitForHealth();
    if (!healthy) {
      console.error(`Backend did not become healthy at ${healthUrl}`);
      backend.kill();
      process.exit(1);
    }

    const clientEnv = {
      ...process.env,
      VITE_API_BASE_URL: `http://localhost:${backendPort}`,
    };

    console.log(`Starting client with VITE_API_BASE_URL=${clientEnv.VITE_API_BASE_URL}`);

    const client = spawn("npm", ["run", "dev:client"], {
      env: clientEnv,
      stdio: "inherit",
    });

    const cleanup = () => {
      try {
        backend.kill();
      } catch (e) {}
      try {
        client.kill();
      } catch (e) {}
      process.exit(0);
    };

    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);

    backend.on("exit", (code) => {
      console.log(`Backend exited with ${code}`);
      cleanup();
    });

    client.on("exit", (code) => {
      console.log(`Client exited with ${code}`);
      cleanup();
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
