import * as z from "zod";

export const personalDetailsSchema = z.object({
  firstName: z.string().trim().min(1, "app.required").max(100),
  lastName: z.string().trim().min(1, "app.required").max(100),
});

export const addProgrammeSchema = z.object({
  programme: z.string().trim().min(1, "app.required").max(120),
  faculty: z.string().trim().min(1, "app.required").max(120),
});
