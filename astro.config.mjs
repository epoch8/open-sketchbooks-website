import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import node from "@astrojs/node";
import path from "node:path";

export default defineConfig({
  site: "https://open-sketchbook.place",
  output: "server",
  base: "/",
  adapter: node({ mode: "standalone" }),

  integrations: [
    react(),
    mdx(), // 👈 добавили MDX
  ],

  build: {
    assets: "_astro",
  },

  vite: {
    resolve: {
      alias: {
        "@": path.resolve("./src"),
        "@components": path.resolve("./src/components"),
        "@content": path.resolve("./src/content"),
        "@styles": path.resolve("./src/styles"),
      },
    },
  },
});