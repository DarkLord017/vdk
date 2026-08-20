import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      // Readable, collision-free class names in the shipped stylesheet.
      generateScopedName: "vdk-[local]-[hash:base64:5]",
    },
  },
  build: {
    lib: {
      entry: resolve(import.meta.dirname, "src/index.ts"),
      formats: ["es"],
      fileName: () => "index.js",
    },
    cssCodeSplit: false,
    sourcemap: true,
    rollupOptions: {
      external: [
        "react",
        "react/jsx-runtime",
        "react-dom",
        "@gear-js/api",
        "@gear-js/react-hooks",
        "@polkadot/api",
        "@polkadot/util",
        "@polkadot/util-crypto",
        "@tanstack/react-query",
        "sails-js",
      ],
      output: {
        assetFileNames: "style.css",
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    globals: true,
  },
});
