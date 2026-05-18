import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => {
  const isVercel = process.env.VERCEL === "1";
  const isBuild = command === "build";

  return {
    plugins: [react()],
    base: isVercel || !isBuild ? "/" : "/HireFlow2/",
    server: {
      open: true,
      proxy: {
        "/api": "http://localhost:5000",
        "/health": "http://localhost:5000",
      },
    },
  };
});
