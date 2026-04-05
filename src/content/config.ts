import { defineCollection, z } from "astro:content";

/* 🔒 базовый slug (на будущее и для связей) */
const slug = z.string().regex(/^[a-z0-9-]+$/);

/* ================================
   ARTISTS
================================ */

const artists = defineCollection({
  schema: z.object({
    title: z.string().min(1),

    instagram: z.string().optional(),
    style: z.string().optional(),
  }),
});

/* ================================
   WORKS
================================ */

const works = defineCollection({
  schema: z.object({
    title: z.string().min(1).optional(),

    /* 🔗 связь с artist.slug */
    artist: slug,

    image: z.string().min(1),

    year: z.number().int().optional(),

    tags: z.array(z.string()).optional(),
  }),
});

/* ================================
   EVENTS
================================ */

const events = defineCollection({
  schema: z.object({
    title: z.string().min(1),

    date: z.coerce.date(),

    location: z.string().min(1),

    description: z.string().optional(),

    artists: z.array(slug).default([]),

    cover: z.string().optional(),
  }),
});

/* ================================
   SKETCHBOOKS
================================ */

const sketchbooks = defineCollection({
  schema: z.object({
    title: z.string().min(1),

    /* 👤 автор */
    author: z.string().min(1), // slug как string — достаточно

    published: z.boolean().default(false),

    /* 📅 */
    year: z.number().int(),

    /* 🏷 */
    tags: z.array(z.string()).default([]),

    /* 📦 формат */
    format: z.object({
      physical: z.boolean().default(true),
      digital: z.boolean().default(false),
    }),

    /* SEO */
    seoDescription: z.string().optional(),

    /* 🎨 обложка */
    cover: z.string().min(1),

    /* 📐 дефолт */
    defaultAspect: z
      .enum(["portrait", "square", "landscape"])
      .default("portrait"),

    /* 📄 страницы */
    pages: z
      .array(
        z.object({
          src: z.string().min(1),

          caption: z.string().optional(),

          aspect: z
            .enum(["portrait", "square", "landscape"])
            .optional(),
        })
      )
      .min(1),

    /* ⚙️ UI */
    settings: z
      .object({
        showCaptions: z.boolean().default(true),
        allowZoom: z.boolean().default(true),
        background: z
          .enum(["light", "dark"])
          .default("light"),
      })
      .default({}),
  }),
});

/* ================================
   EXPORT
================================ */

export const collections = {
  artists,
  works,
  events,
  sketchbooks,
};