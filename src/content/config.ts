import { defineCollection, z } from "astro:content";

const artists = defineCollection({
  schema: z.object({
    title: z.string()
  })
});

export const collections = {
  artists
};