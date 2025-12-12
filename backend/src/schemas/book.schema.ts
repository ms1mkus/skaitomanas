import { z } from 'zod';

export const createBookSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  cover_image_url: z.string().url().optional(),
  language: z.string().default('lt'),
  tags: z.array(z.string()).optional().default([]),
  status: z.enum(['draft', 'published']).optional().default('draft'),
});

export const updateBookSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  cover_image_url: z.string().url().optional(),
  language: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published']).optional(),
});

export const bookQuerySchema = z.object({
  tag: z.string().optional(),
  author: z.string().optional(),
  language: z.string().optional(),
  limit: z.coerce.number().optional().default(20),
  offset: z.coerce.number().optional().default(0),
});

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
export type BookQueryInput = z.infer<typeof bookQuerySchema>;
