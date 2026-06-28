import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite dev server proxies the API to the Express backend so the whole app
// runs from a single origin (http://localhost:5173).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4519",
        changeOrigin: true,
      },
    },
  },
});
