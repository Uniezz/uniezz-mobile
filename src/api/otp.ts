import type { OtpRequestInputBody, OtpVerifyInputBody } from "@/@types/auth";
import { OTP_REQUEST_ERRORS, OTP_VERIFY_ERRORS } from "@/utils";
import { api } from "./client";

const SEND_FALLBACK = "Couldn’t send the code. Try again.";
const VERIFY_FALLBACK = "Couldn’t verify the code. Try again.";

export async function requestOtpCode(body: OtpRequestInputBody) {
  const { response } = await api
    .POST("/auth/otp/request", { body })
    .catch(() => {
      throw new Error(SEND_FALLBACK);
    });

  // error is undefined for non-2xx replies with an empty body, so check status.
  if (!response.ok) {
    throw new Error(OTP_REQUEST_ERRORS[response.status] ?? SEND_FALLBACK);
  }
}

export async function verifyOtpCode(body: OtpVerifyInputBody) {
  const { data, response } = await api
    .POST("/auth/otp/verify", { body })
    .catch(() => {
      throw new Error(VERIFY_FALLBACK);
    });

  if (!response.ok || !data) {
    throw new Error(OTP_VERIFY_ERRORS[response.status] ?? VERIFY_FALLBACK);
  }

  return data;
}
