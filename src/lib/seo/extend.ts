// src/lib/seo/extend.ts

import type { SEOConfig } from "./types";

export function extendSEO(
  base: SEOConfig,
  override: Partial<SEOConfig>
): SEOConfig {
  return {
    ...base,
    ...override,
    og: { ...base.og, ...override.og },
    twitter: { ...base.twitter, ...override.twitter },
  };
}