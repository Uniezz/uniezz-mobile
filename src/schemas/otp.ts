import * as z from "zod";

export const OTP_STEPS = ["email", "code"] as const;
export type OtpStep = (typeof OTP_STEPS)[number];

const emailError = (iss: { input: unknown }) =>
  !iss.input
    ? "Enter your university email address."
    : "Please, provide correct email address";

export const emailOtpSchema = z.object({
  step: z.literal("email"),
  email: z.email({ error: emailError }),
  code: z.string(),
});

export const codeOtpSchema = z.object({
  step: z.literal("code"),
  email: z.email({ error: emailError }),
  code: z.string().length(6, {
    error: "Enter the 6-digit code we sent you.",
  }),
});

export const otpSchema = z.discriminatedUnion("step", [
  emailOtpSchema,
  codeOtpSchema,
]);

export type EmailOtpSchema = z.infer<typeof emailOtpSchema>;
export type CodeOtpSchema = z.infer<typeof codeOtpSchema>;
export type OtpSchema = z.infer<typeof otpSchema>;

export const otpDefaultValues: OtpSchema = {
  step: "email",
  email: "",
  code: "",
};
