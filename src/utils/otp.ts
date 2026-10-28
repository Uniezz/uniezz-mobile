import { TextInputProps } from "react-native";

export const CELL_COUNT = 6;
export const autoComplete: TextInputProps["autoComplete"] = "one-time-code";

// ErrorBody.error is a machine code, so map statuses to user-facing text.
export const OTP_REQUEST_ERRORS: Record<number, string> = {
  400: "Use the email address your university issued.",
  422: "Use the email address your university issued.",
  429: "Too many code requests. Wait a moment and try again.",
};

export const OTP_VERIFY_ERRORS: Record<number, string> = {
  400: "Enter the 6-digit code we sent you.",
  401: "Wrong or expired code. After 5 attempts, request a new one.",
  422: "Enter the 6-digit code we sent you.",
};
