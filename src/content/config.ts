import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

function deriveSection(id: string): string {
  const dir = id.split('/')[0];
  return dir
    .replace(/^\d+-/, '')
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const docsCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    section: z.string().optional(),
    order: z.number().optional().default(0),
  }),
  loader: {
    name: 'docs',
    load: async (ctx: any) => {
      await glob({ pattern: '**/*.{md,mdx}', base: './src/content/docs' }).load(ctx);
      for (const entry of ctx.store.values()) {
        const { digest, ...rest } = entry;
        ctx.store.set({
          ...rest,
          data: { ...entry.data, section: deriveSection(entry.id) },
        });
      }
    },
  },
});

export const collections = {
  'docs': docsCollection,
};
