import * as z from "zod";

const emailError = (iss: { input: unknown }) =>
  !iss.input ? "validation.emailRequired" : "validation.emailInvalid";

export const emailOtpSchema = z.object({
  step: z.literal("email"),
  email: z.email({ error: emailError }),
  code: z.string(),
});

export const codeOtpSchema = z.object({
  step: z.literal("code"),
  email: z.email({ error: emailError }),
  code: z.string().regex(/^\d{6}$/, {
    error: "validation.codeInvalid",
  }),
});

export const otpSchema = z.discriminatedUnion("step", [
  emailOtpSchema,
  codeOtpSchema,
]);

export type EmailOtpSchema = z.infer<typeof emailOtpSchema>;
export type CodeOtpSchema = z.infer<typeof codeOtpSchema>;
export type OtpSchema = z.infer<typeof otpSchema>;
export type OtpStep = OtpSchema["step"];

export const otpDefaultValues: OtpSchema = {
  step: "email",
  email: "",
  code: "",
};
