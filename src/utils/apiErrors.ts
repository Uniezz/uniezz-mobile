import type { paths } from "@/@types/schema";
import { OTP_REQUEST_ERRORS, OTP_VERIFY_ERRORS } from "./otp";
import { REPORT_ERRORS } from "./report";

type EndpointErrors = {
  statuses: Record<number, string>;
  // used for unmapped statuses and for network failures
  fallback?: string;
};

// keys are checked against the schema; lookups take the middleware's plain string path
export const ENDPOINT_ERRORS: Partial<Record<string, EndpointErrors>> = {
  "/auth/otp/request": {
    statuses: OTP_REQUEST_ERRORS,
    fallback: "otp.sendFailed",
  },
  "/auth/otp/verify": {
    statuses: OTP_VERIFY_ERRORS,
    fallback: "otp.verifyFailed",
  },
  "/reports": { statuses: REPORT_ERRORS },
} satisfies Partial<Record<keyof paths, EndpointErrors>>;
