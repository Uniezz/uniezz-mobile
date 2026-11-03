import * as z from "zod";

export const newPostSchema = z.object({
  type: z.enum(["question", "announcement"]),
  title: z.string().trim().min(3, "postComposer.titleLength").max(150),
  content: z.string().trim().min(10, "postComposer.detailsLength").max(5000),
  audience: z.enum(["all", "university"]),
});
