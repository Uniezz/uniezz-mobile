import * as z from "zod";

export const addMaterialSchema = z.object({
  subject: z.string().trim().min(1, "app.required").max(120),
  university: z.string().trim().min(1, "app.required").max(120),
});
