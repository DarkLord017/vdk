import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// `base` matches the GitHub Pages project path; override with VDK_BASE for other hosts.
export default defineConfig({
  base: process.env.VDK_BASE ?? "/vdk/",
  plugins: [react()],
  define: {
    // @polkadot/api and its deps expect a Node-ish global.
    global: "globalThis",
  },
  test: {
    environment: "jsdom",
    globals: true,
  },
});
