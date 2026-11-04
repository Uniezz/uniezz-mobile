import * as z from "zod";

export const createGroupSchema = z.object({
  groupName: z.string().trim().min(1, "app.required").max(80),
  members: z.array(z.string()).min(1, "app.required"),
});
