import type { OtpRequestInputBody, OtpVerifyInputBody } from "@/@types/auth";
import { api } from "./client";

export async function requestOtpCode(body: OtpRequestInputBody) {
  await api.POST("/auth/otp/request", { body });
}

export async function verifyOtpCode(body: OtpVerifyInputBody) {
  const { data } = await api.POST("/auth/otp/verify", { body });
  return data!;
}
