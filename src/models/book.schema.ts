import { z } from 'zod';

export const createBookSchema = z.object({
  isbn: z.string().min(10, 'ISBN must be at least 10 characters'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  totalCopies: z.number().int().positive(),
  categoryIds: z.array(z.string()).min(1, 'At least one category is required'),
  authorIds: z.array(z.string()).min(1, 'At least one author is required'),
});

export const updateBookSchema = createBookSchema.partial();

export const deleteBookSchema = z.object({
  isbn: z.string().min(10, 'ISBN must be at least 10 characters'),
});

export const searchBooksSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  author: z.string().optional(),
  available: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
export type SearchBooksParams = z.infer<typeof searchBooksSchema>; 