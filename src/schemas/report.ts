import * as z from "zod";

export const reportSchema = z.object({
  reason: z.enum([
    "spam",
    "harassment",
    "inappropriate",
    "hate_speech",
    "other",
  ]),
  details: z.string().trim().max(1000, "report.detailsError"),
});
