import * as z from "zod";

export const postTagsSchema = z.array(z.string().trim().min(1).max(30)).max(10);

const postFields = {
  title: z.string().trim().min(3, "postComposer.titleLength").max(150),
  content: z.string().trim().min(10, "postComposer.detailsLength").max(5000),
  tags: postTagsSchema,
};

export const newPostSchema = z
  .object({
    ...postFields,
    type: z.enum(["question", "announcement", "event"]),
    audience: z.enum(["all", "university"]),
    eventDate: z.date().nullable(),
    photos: z
      .array(
        z.object({
          uri: z.string(),
          mimeType: z.string().nullish(),
          fileSize: z.number().nullish(),
        }),
      )
      .max(10, "postComposer.photosError"),
  })
  .refine((post) => post.type !== "event" || post.eventDate !== null, {
    path: ["eventDate"],
    message: "app.required",
  });

export const editPostSchema = z.object(postFields);

export const commentSchema = z.object({
  content: z.string().trim().min(1).max(1000),
});
