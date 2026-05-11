import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => {
  const isBuild = command === "build";

  return {
    plugins: [react()],
    base: isBuild ? "/HireFlow2/" : "/",
    server: {
      port: 5173,
      strictPort: true,
      open: true,
    },
  };
});
