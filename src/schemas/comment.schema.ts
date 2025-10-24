import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;


