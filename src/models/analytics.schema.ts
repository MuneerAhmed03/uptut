import { z } from "zod";

export const dateRangeSchema = z
  .object({
    startDate: z
      .string()
      .datetime()
      .default(() =>
        new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
      ),
    endDate: z
      .string()
      .datetime()
      .default(() => new Date().toISOString()),
  })
  .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: "End date must be after start date",
  });

export const analyticsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().default(10),
});

export type DateRangeParams = z.infer<typeof dateRangeSchema>;
export type AnalyticsQueryParams = z.infer<typeof analyticsQuerySchema>;
