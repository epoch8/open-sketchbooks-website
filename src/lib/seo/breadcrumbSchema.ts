// lib/seo/breadcrumbSchema.ts

type Crumb = {
  label: string;
  href?: string;
};

function normalizeUrl(baseUrl: string, href?: string) {
  if (!href) return baseUrl;
  if (href.startsWith("http")) return href;
  return `${baseUrl}${href}`;
}

export function buildBreadcrumbSchema(
  baseUrl: string,
  crumbs: Crumb[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      item: normalizeUrl(baseUrl, crumb.href),
    })),
  };
}