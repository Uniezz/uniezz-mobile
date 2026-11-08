import * as z from "zod";
import { splitInterests } from "@/utils/profile";

export const personalDetailsSchema = z.object({
  firstName: z.string().trim().min(1, "app.required").max(100),
  lastName: z.string().trim().min(1, "app.required").max(100),
  bio: z.string().trim().max(500, "students.bioError"),
  interests: z.string().refine((value) => {
    const items = splitInterests(value);
    return items.length <= 10 && items.every((item) => item.length <= 30);
  }, "students.interestsError"),
  gender: z.enum(["male", "female"]).nullable(),
});

export const addProgrammeSchema = z.object({
  programme: z.string().trim().min(1, "app.required").max(120),
  faculty: z.string().trim().min(1, "app.required").max(120),
});

export const programmeDetailsSchema = z.object({
  yearOfStudy: z.number().int().min(1).max(10).nullable(),
  level: z
    .enum([
      "first_cycle",
      "second_cycle",
      "long_cycle",
      "third_cycle",
      "phd_school",
    ])
    .nullable(),
  modeOfStudies: z.enum(["full_time", "part_time"]).nullable(),
  status: z.enum(["active", "graduated", "suspended", "cancelled"]),
});
