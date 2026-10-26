import type { OtpRequestInputBody, OtpVerifyInputBody } from "@/@types/auth";
import { OTP_REQUEST_ERRORS, OTP_VERIFY_ERRORS } from "@/utils";
import { api } from "./client";

export async function requestOtpCode(body: OtpRequestInputBody) {
  const { error, response } = await api.POST("/auth/otp/request", { body });

  if (error) {
    throw new Error(
      OTP_REQUEST_ERRORS[response.status] ??
        "Couldn’t send the code. Try again.",
    );
  }
}

export async function verifyOtpCode(body: OtpVerifyInputBody) {
  const { data, error, response } = await api.POST("/auth/otp/verify", {
    body,
  });

  if (error) {
    throw new Error(
      OTP_VERIFY_ERRORS[response.status] ??
        "Couldn’t verify the code. Try again.",
    );
  }

  return data;
}
