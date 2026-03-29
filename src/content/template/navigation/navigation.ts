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
    "",
  company: "",
};

/* ======================================================
   MAIN NAV
====================================================== */

export const mainNav: NavItem[] = [
  {
    label: "Artists",
    href: "/artists",
    description: "Browse artists in Open Sketchbooks",
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
    enabled: false,
  },
];

/* ======================================================
   FOOTER NAV
====================================================== */

export const footerNav: NavSection[] = [
  {
    title: "Sketchbooks",
    enabled: true,
    items: [
      {
        label: "Artists",
        href: "/artists",
        enabled: true,
      },
      {
        label: "GitHub",
        href: "https://github.com/epoch8/vedana",
        external: true,
        enabled: false,
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
    enabled: false,
    items: [
      {
        label: "About",
        href: "/about",
        enabled: false,
      },
      {
        label: "Careers",
        href: "/careers",
        enabled: false,
      },
      {
        label: "Contact",
        href: "/contact",
        enabled: false,
      },
      {
        label: "Legal",
        href: "/legal",
        enabled: false,
      },
    ],
  },
];