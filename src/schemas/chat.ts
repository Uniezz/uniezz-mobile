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

export const messageSchema = z.object({
  text: z.string().trim().min(1).max(2000),
});
