import { TextInputProps } from "react-native";

export const CELL_COUNT = 6;
export const autoComplete: TextInputProps["autoComplete"] = "one-time-code";

// ErrorBody.error is a machine code, so map statuses to user-facing text.
export const OTP_REQUEST_ERRORS: Record<number, string> = {
  400: "validation.universityEmailRequired",
  422: "validation.universityEmailRequired",
  429: "otp.tooManyRequests",
};

export const OTP_VERIFY_ERRORS: Record<number, string> = {
  400: "validation.codeInvalid",
  401: "otp.codeExpired",
  422: "validation.codeInvalid",
};
