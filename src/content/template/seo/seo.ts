// src/content/vedana/seo/seo.ts

import type { SEOConfig } from "@/lib/seo/types";

export const SEOBase: SEOConfig = {
  title: "Astro Website Starter",
  description:
    "Quick template for building content-rich websites with Astro. Features SEO best practices, responsive design, and easy customization.",

  canonical: "",

  og: {
    type: "website",
    image: "/og/default.png",
    imageAlt: "Website preview",
  },

  twitter: {
    card: "summary_large_image",
    image: "/og/default.png",
  },
};