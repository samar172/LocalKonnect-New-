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
      "403f71b0d6ad.ngrok-free.app",
      "d4afe9a97be6.ngrok-free.app",
      "bfded70b8e30.ngrok-free.app",
      "c71dabd281d4.ngrok-free.app",
      "7ad609349e96.ngrok-free.app",
      "2ca81e0be33a.ngrok-free.app",
    ],
  },
  build: {
    outDir: "build",
    sourcemap: true,
  },
});
