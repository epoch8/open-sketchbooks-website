import { defineCollection, z } from "astro:content";

/* 🔒 базовый slug (на будущее и для связей) */
const slug = z.string().regex(/^[a-z0-9-]+$/);

/* ================================
   ARTISTS
================================ */

const paymentMethodSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("link"),
    title: z.string().min(1),
    description: z.string().optional(),
    url: z.string().url(),
  }),

  z.object({
    type: z.literal("account"),
    title: z.string().min(1),
    accountNumber: z.string().min(1),
  }),

  z.object({
    type: z.literal("card"),
    title: z.string().min(1),
    cardNumber: z.string().min(1),
  }),

  z.object({
    type: z.literal("cash"),
    title: z.string().min(1),
    description: z.string().optional(),
  }),
]);

const artists = defineCollection({
  schema: z.object({
    title: z.string().min(1),

    /* 👤 соцсети */
    instagram: z.string().optional(),

    /* 🎨 опционально */
    style: z.string().optional(),

    /* 💸 оплата */
    paymentMethods: z.array(paymentMethodSchema).default([]),

    /* 💬 контакт */
    contact: z
      .object({
        telegram: z
          .object({
            url: z.string().url(),
            label: z.string().optional(),
          })
          .optional(),
      })
      .optional(),
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
    author: z.string().min(1),

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
    cover: z.string().min(1).optional(),

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
      .optional()
      .default([]),

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
   PRODUCTS
================================ */

const relation = z.object({
  type: z.enum(["from", "related", "part_of"]),
  target: z.enum(["sketchbook", "collection"]),
  slug: slug,

  // опционально (только для from)
  page: z.number().int().positive().optional(),
});

export const products = defineCollection({
  schema: z.object({
    /* 🧩 тип продукта */
    type: z.enum(["print", "original", "zine"]),

    /* 📛 */
    title: z.string().min(1),

    /* 💰 */
    price: z.object({
      amount: z.number().positive(),
      currency: z.enum(["GEL", "USD", "EUR"]),
    }),

    /* 👤 */
    artist: slug,

    /* 🖼 */
    image: z.string().min(1),

    /* 📦 */
    status: z.enum(["available", "sold", "reserved"]).default("available"),

    /* ⭐ placement */
    featured: z
      .array(z.enum(["artist", "items", "series"]))
      .default([]),

    /* 🔗 связи */
    relations: z.array(relation).default([]),

    /* 🎨 мета */
    medium: z.string().optional(),
    size: z.string().optional(),
    edition: z.string().optional(),
  }),
});

/* ================================
   PRODUCT COLLECTIONS
================================ */

const productCollections = defineCollection({
  schema: z.object({
    title: z.string().min(1),

    /* 👤 */
    artist: slug,

    /* 🔗 связь с sketchbook */
    sketchbook: slug.optional(),

        /* ⭐ placement */
    featured: z
      .array(z.enum(["artist", "items", "series"]))
      .default([]),

    /* 📝 */
    description: z.string().optional(),

    /* 🖼 */
    cover: z.string().optional(),
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
  products,
  productCollections,
};