import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./", // Set base path to relative path
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Add other plugins here if needed
  ],
  resolve: {
    alias: {
      "@": "./src",
    },
  },
});
