import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    open: true,
    // host: true, // This exposes the server on your local network
    host: "0.0.0.0",
    allowedHosts: [
    ],
  },
  build: {
    outDir: "build",
    sourcemap: true,
  },
});
