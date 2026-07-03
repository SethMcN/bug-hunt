import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite dev server proxies the API to the Express backend so the whole app
// runs from a single origin (http://localhost:5173). API_PORT moves both the
// Express listener and this proxy, so one env var is the only knob.
const apiPort = Number(process.env.API_PORT) || 4519;

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: `http://localhost:${apiPort}`,
        changeOrigin: true,
      },
    },
  },
});
