import * as z from "zod";

export const connectionFiltersSchema = z.object({
  gender: z.enum(["male", "female"]).nullable(),
  universities: z.array(z.string()),
  faculty: z.string().nullable(),
  levels: z.array(
    z.enum([
      "first_cycle",
      "second_cycle",
      "long_cycle",
      "third_cycle",
      "phd_school",
    ]),
  ),
  matchInterests: z.boolean(),
});

export const connectionPreferencesSchema = z.object({
  birthDate: z.date().nullable(),
  intent: z.string().trim().max(200),
});
