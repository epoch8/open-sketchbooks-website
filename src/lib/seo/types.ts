// src/lib/seo/types.ts

export interface SEOConfig {
  title: string;
  description: string;

  /**
   * Base site URL (used to build absolute URLs for OG, canonical, etc.)
   */
  siteUrl?: string;

  /**
   * Absolute canonical URL (optional override)
   */
  canonical?: string;

  noindex?: boolean;

  og?: {
    type?: "website" | "article" | "product";

    /**
     * Can be relative (/og/...) or absolute (https://...)
     */
    image?: string;

    imageAlt?: string;
  };

  twitter?: {
    card?: "summary" | "summary_large_image";

    /**
     * Can be relative or absolute
     */
    image?: string;
  };
}