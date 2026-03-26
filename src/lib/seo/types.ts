// src/lib/seo/types.ts

export interface SEOConfig {
  title: string;
  description: string;

  canonical?: string;
  noindex?: boolean;

  og?: {
    type?: "website" | "article" | "product";
    image?: string;
    imageAlt?: string;
  };

  twitter?: {
    card?: "summary" | "summary_large_image";
    image?: string;
  };
}