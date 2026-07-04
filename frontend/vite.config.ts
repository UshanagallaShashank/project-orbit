// Vite config with React, Tailwind, PWA support, and a proxy to the FastAPI backend
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Project Orbit",
        short_name: "Orbit",
        description: "Personal multi-agent AI assistant",
        theme_color: "#0a0a0a",
        background_color: "#0a0a0a",
        display: "standalone",
        icons: [{ src: "/orbit-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
      },
    }),
  ],
  server: {
    proxy: {
      "/health": "http://localhost:8000",
      "/agents": "http://localhost:8000",
      "/models": "http://localhost:8000",
    },
  },
});
