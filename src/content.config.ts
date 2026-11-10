import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const chapters = defineCollection({
  loader: glob({
    pattern: '*/index.mdx',
    base: './src/content/chapters',
    generateId: ({ entry }) => entry.split('/')[0],
  }),
  schema: z.object({
    title: z.string(),
    nav: z.string(),
    group: z.enum(['Foundations', 'How memory behaves', 'Working with it']),
    order: z.number().int().positive(),
    /** Short card/sidebar description. */
    blurb: z.string(),
    /** Meta description for search and social previews. */
    description: z.string(),
    /** Visible page introduction; falls back to the description. */
    lede: z.string().optional(),
    tone: z
      .enum(['l0', 'l1', 'l2', 'l3', 'l4', 'l5', 'accent', 'violet', 'warn'])
      .default('accent'),
    sources: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { chapters };
