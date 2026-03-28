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
   EXPORT
================================ */

export const collections = {
  artists,
  works,
};