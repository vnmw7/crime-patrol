import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks: undefined,
      },
    },
    target: "es2020",
    minify: "esbuild",
    sourcemap: false,
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
  server: {
    host: true,
    port: 3000,
  },
});
