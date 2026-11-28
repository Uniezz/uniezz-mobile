import * as z from "zod";

const groupName = z.string().trim().min(1, "app.required").max(80);

export const createGroupSchema = z.object({
  groupName,
  members: z.array(z.string()).min(2, "app.minimumMembers"),
});

// adding people to an existing group: the name is not edited there, and one person is enough
export const addGroupMembersSchema = z.object({
  groupName: z.string(),
  members: z.array(z.string()).min(1, "app.required"),
});

export const renameGroupSchema = z.object({ groupName });

// a message needs text or at least one photo; the API takes up to 5 images
export const messageSchema = z
  .object({
    text: z.string().trim().max(2000),
    photos: z
      .array(
        z.object({
          uri: z.string(),
          mimeType: z.string().nullish(),
          fileSize: z.number().nullish(),
        }),
      )
      .max(5),
  })
  .refine(({ text, photos }) => text.length > 0 || photos.length > 0, {
    path: ["text"],
    message: "app.required",
  });
