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
  intent: z.string().trim().max(200),
});

const MIN_AGE = 16;

// set once, before discovery: the student must be at least MIN_AGE
export const birthDateSchema = z.object({
  birthDate: z
    .date()
    .nullable()
    .refine((value) => {
      const latest = new Date();
      latest.setFullYear(latest.getFullYear() - MIN_AGE);
      return value !== null && value <= latest;
    }, "connections.birthDateInvalid"),
});
