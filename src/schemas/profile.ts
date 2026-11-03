import * as z from "zod";

export const profileFormSchema = z.object({
  firstName: z.string().trim(),
  lastName: z.string().trim(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const programmeFormSchema = z.object({
  faculty: z.string().trim().min(1, "profile.requiredFields"),
  programme: z.string().trim().min(1, "profile.requiredFields"),
  yearOfStudy: z
    .string()
    .trim()
    .refine((year) => year === "" || (/^\d+$/.test(year) && Number(year) > 0), {
      error: "profile.invalidYear",
    }),
  isPrimary: z.boolean(),
});

export type ProgrammeFormValues = z.infer<typeof programmeFormSchema>;

export const programmeFormDefaultValues: ProgrammeFormValues = {
  faculty: "",
  programme: "",
  yearOfStudy: "",
  isPrimary: false,
};
