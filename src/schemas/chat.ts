import * as z from "zod";

export const createGroupSchema = z.object({
  groupName: z.string().trim().min(1, "app.required").max(80),
  members: z.array(z.string()).min(2, "app.minimumMembers"),
});

export const messageSchema = z.object({
  text: z.string().trim().min(1).max(2000),
});
