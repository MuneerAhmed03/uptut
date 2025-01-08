import { z } from "zod";

export const borrowBookSchema = z.object({
  bookId: z.string().uuid(),
});

export const borrowQuerySchema = z.object({
  status: z.enum(["active", "returned", "overdue"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});

export type BorrowBookInput = z.infer<typeof borrowBookSchema>;
export type BorrowQueryParams = z.infer<typeof borrowQuerySchema>;
