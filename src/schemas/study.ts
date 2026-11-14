import * as z from "zod";

export const courseSchema = z.object({
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
  semester: z
    .number()
    .int()
    .min(1, "study.semesterError")
    .max(12, "study.semesterError"),
  difficulty: z.number().int().min(1, "study.difficultyError").max(5),
  description: z
    .string()
    .trim()
    .min(1, "study.descriptionError")
    .max(5000, "study.descriptionError"),
  materials: z
    .array(
      z.object({
        uri: z.string(),
        name: z.string(),
        mimeType: z.string().nullish(),
        fileSize: z.number().nullish(),
      }),
    )
    .max(10, "study.materialsHint"),
  materialType: z.enum(["exam", "colloquium", "lab", "notes"]),
});
