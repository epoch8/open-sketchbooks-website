import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const slug = z.string().regex(/^[a-z0-9-]+$/);

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
  loader: glob({ pattern: "**/*.md", base: "./src/content/artists" }),
  schema: z.object({
    title: z.string().min(1),
    instagram: z.string().optional(),
    threads: z.string().optional(),
    website: z.string().url().optional(),
    style: z.string().optional(),
    paymentMethods: z.array(paymentMethodSchema).default([]),
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

const works = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/works" }),
  schema: z.object({
    title: z.string().min(1).optional(),
    artist: slug,
    image: z.string().min(1),
    year: z.number().int().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const events = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/events" }),
  schema: z.object({
    title: z.string().min(1),
    date: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    location: z.string().min(1),
    locationUrl: z.string().url().optional(),
    description: z.string().optional(),
    artists: z.array(slug).default([]),
    sketchbooks: z.array(slug).default([]),
    cover: z.string().optional(),
  }),
});

const sketchbooks = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/sketchbooks" }),
  schema: z.object({
    title: z.string().min(1),
    author: z.string().min(1),
    published: z.boolean().default(false),
    size_mm: z
      .object({
        width: z.number().positive().optional(),
        height: z.number().positive().optional(),
      })
      .optional(),
    year: z.number().int().optional(),
    tags: z.array(z.string()).default([]),
    format: z.object({
      physical: z.boolean().default(true),
      digital: z.boolean().default(false),
    }),
    seoDescription: z.string().optional(),
    cover: z.string().min(1).optional(),
    pages: z
      .array(
        z.object({
          src: z.string().min(1),
          caption: z.string().optional(),
          aspect: z.enum(["portrait", "square", "landscape"]).optional(),
        })
      )
      .optional()
      .default([]),
    featured: z
      .array(
        z.object({
          src: z.string().min(1),
          caption: z.string().optional(),
          aspect: z.enum(["portrait", "square", "landscape"]).optional(),
        })
      )
      .optional()
      .default([]),
    related: z
      .array(
        z.object({
          slug: z.string().min(1),
          type: z.enum(["similar"]).default("similar"),
        })
      )
      .optional()
      .default([]),
    settings: z
      .object({
        showCaptions: z.boolean().default(true),
        allowZoom: z.boolean().default(true),
        background: z.enum(["light", "dark"]).default("light"),
      })
      .default({}),
  }),
});

const relation = z.object({
  type: z.enum(["from", "related", "part_of"]),
  target: z.enum(["sketchbook", "collection"]),
  slug: slug,
  page: z.number().int().positive().optional(),
});

export const products = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/products" }),
  schema: z.object({
    type: z.enum(["print", "original", "zine"]),
    title: z.string().min(1),
    price: z.object({
      amount: z.number().positive(),
      currency: z.enum(["GEL", "USD", "EUR"]),
    }),
    artist: slug,
    image: z.string().min(1),
    status: z.enum(["available", "sold", "reserved"]).default("available"),
    featured: z.array(z.enum(["artist", "items", "series"])).default([]),
    relations: z.array(relation).default([]),
    medium: z.string().optional(),
    size: z.string().optional(),
    edition: z.string().optional(),
  }),
});

const productCollections = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/productCollections" }),
  schema: z.object({
    title: z.string().min(1),
    artist: slug,
    sketchbook: slug.optional(),
    featured: z.array(z.enum(["artist", "items", "series"])).default([]),
    description: z.string().optional(),
    cover: z.string().optional(),
  }),
});

export const collections = {
  artists,
  works,
  events,
  sketchbooks,
  products,
  productCollections,
};
