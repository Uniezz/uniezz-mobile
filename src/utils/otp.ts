import { Platform, TextInputProps } from "react-native";

export const CELL_COUNT = 6;
export const autoComplete = Platform.select<TextInputProps["autoComplete"]>({
  android: "sms-otp",
  default: "one-time-code",
});
