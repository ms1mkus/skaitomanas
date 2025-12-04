import { z } from 'zod';

export const createChapterSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string().min(1),
  chapter_number: z.number().int().positive(),
  is_published: z.boolean().optional().default(false),
});

export const updateChapterSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  content: z.string().min(1).optional(),
  chapter_number: z.number().int().positive().optional(),
  is_published: z.boolean().optional(),
});

export type CreateChapterInput = z.infer<typeof createChapterSchema>;
export type UpdateChapterInput = z.infer<typeof updateChapterSchema>;


