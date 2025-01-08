import { z } from "zod";

export const paymentMethodSchema = z.enum([
  "CREDIT_CARD",
  "DEBIT_CARD",
  "CASH",
]);
export const paymentStatusSchema = z.enum(["PENDING", "PAID", "FAILED"]);

export const payFineSchema = z.object({
  transactionId: z.string().uuid(),
  paymentMethod: paymentMethodSchema,
});

export const paymentQuerySchema = z.object({
  status: paymentStatusSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});

export type PayFineInput = z.infer<typeof payFineSchema>;
export type PaymentQueryParams = z.infer<typeof paymentQuerySchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
