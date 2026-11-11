import type { paths } from "@/@types/schema";
import { CANDIDATE_ERRORS, CONNECTION_PREFERENCES_ERRORS } from "./connections";
import { FAQ_PROPOSAL_ERRORS } from "./faq";
import { OTP_REQUEST_ERRORS, OTP_VERIFY_ERRORS } from "./otp";
import { REPORT_ERRORS } from "./report";
import { STUDY_CREATE_ERRORS } from "./study";

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
  "/connections/candidates/{id}": { statuses: CANDIDATE_ERRORS },
  "/connections/me": { statuses: CONNECTION_PREFERENCES_ERRORS },
  "/study/courses": { statuses: STUDY_CREATE_ERRORS },
  "/study/courses/{id}/comments": { statuses: STUDY_CREATE_ERRORS },
  "/study/courses/{id}/files": { statuses: STUDY_CREATE_ERRORS },
  "/faq/proposals": {
    statuses: FAQ_PROPOSAL_ERRORS,
    fallback: "faq.proposalFailed",
  },
} satisfies Partial<Record<keyof paths, EndpointErrors>>;
