import * as z from "zod";

export const emailOtpSchema = z.object({
  email: z.email(),
});

export type EmailOtpSchema = z.infer<typeof emailOtpSchema>;

export const codeOtpSchema = z.object({
  code: z.string().length(6),
});

export type CodeOtpSchema = z.infer<typeof codeOtpSchema>;
