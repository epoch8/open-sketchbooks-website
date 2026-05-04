// src/content/vedana/seo/seo.ts

import type { SEOConfig } from "@/lib/seo/types";

const SITE_URL = "https://open-sketchbook.place";

export const SEOBase: SEOConfig = {
  title: "Open Sketchbooks — Flip Through Real Artists’ Sketchbooks",

  description:
    "Explore real sketchbooks by artists – raw pages, ideas, and visual thinking. Discover artists, flip through sketchbooks, and join open calls and local exhibitions.",

  siteUrl: SITE_URL,

  canonical: SITE_URL,

  og: {
    type: "website",
    image: `${SITE_URL}/og/open-sketchbooks.png`,
    imageAlt: "Open Sketchbooks — artists and sketchbooks",
  },

  twitter: {
    card: "summary_large_image",
    image: `${SITE_URL}/og/open-sketchbooks.png`,
  },
};