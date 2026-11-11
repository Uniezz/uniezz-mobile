import * as z from "zod";

export const createCourseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "study.lengthError")
    .max(150, "study.lengthError"),
  subject: z
    .string()
    .trim()
    .min(3, "study.lengthError")
    .max(150, "study.lengthError"),
  faculty: z
    .string()
    .trim()
    .min(3, "study.lengthError")
    .max(150, "study.lengthError"),
  semester: z.string().regex(/^([1-9]|10)$/, "study.semesterError"),
  difficulty: z.number().int().min(1, "study.difficultyError").max(5),
  description: z.string().trim().max(5000, "study.descriptionError"),
});
