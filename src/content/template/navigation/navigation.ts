// /content/template/navigation/navigation.ts

/* ======================================================
   IMPORT TYPES (ЕДИНЫЙ КОНТРАКТ)
====================================================== */

import type { NavItem } from "@/lib/navigation/types";

/* ======================================================
   TYPES (локальные только для footer/meta)
====================================================== */

export type NavSection = {
  title: string;
  items: NavItem[];
  enabled?: boolean;
};

export type FooterMeta = {
  tagline: string;
  company: string;
};

/* ======================================================
   META
====================================================== */

export const footerMeta: FooterMeta = {
  tagline:
    "Template for Astro-based documentation sites.",
  company: "Built with ❤️ by Epoch8",
};

/* ======================================================
   MAIN NAV
====================================================== */

export const mainNav: NavItem[] = [
  {
    label: "Internal",
    href: "/internal",
    description: "Internal page for testing and development purposes",
    enabled: true,
  },

  {
    label: "Docs",
    href: "/docs",
    description: "Project documentation",
    enabled: false,
  },

  {
    label: "GitHub",
    href: "https://github.com/epoch8/vedana",
    external: true,
    variant: "icon",
    icon: "github",
    enabled: false,
  },

  {
    label: "Book a demo",
    href: "https://calendly.com/olga_t/60min",
    variant: "cta",
    enabled: true,
  },
];

/* ======================================================
   FOOTER NAV
====================================================== */

export const footerNav: NavSection[] = [
  {
    title: "Product",
    enabled: true,
    items: [
      {
        label: "Docs",
        href: "/docs",
        enabled: true,
      },
      {
        label: "GitHub",
        href: "https://github.com/epoch8/vedana",
        external: true,
        enabled: true,
      },
    ],
  },

  {
    title: "Industries",
    enabled: false,
    items: [
      {
        label: "Legal",
        href: "/industries/legal",
        enabled: false,
      },
      {
        label: "HoReCa",
        href: "/industries/horeca",
        enabled: false,
      },
      {
        label: "Development",
        href: "/industries/development",
        enabled: false,
      },
      {
        label: "Support",
        href: "/industries/support",
        enabled: false,
      },
    ],
  },

  {
    title: "Resources",
    enabled: false,
    items: [
      {
        label: "Minimal Modeling",
        href: "https://minimalmodeling.com/",
        external: true,
        enabled: false,
      },
      {
        label: "Database Design Book",
        href: "https://databasedesignbook.com/",
        external: true,
        enabled: false,
      },
    ],
  },

  {
    title: "Company",
    enabled: true,
    items: [
      {
        label: "About",
        href: "/about",
        enabled: true,
      },
      {
        label: "Careers",
        href: "/careers",
        enabled: false,
      },
      {
        label: "Contact",
        href: "/contact",
        enabled: true,
      },
      {
        label: "Legal",
        href: "/legal",
        enabled: false,
      },
    ],
  },
];