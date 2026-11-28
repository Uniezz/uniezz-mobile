import type { paths } from "@/@types/schema";
import {
  CANDIDATE_ERRORS,
  CONNECTION_PREFERENCES_CODES,
  CONNECTION_PREFERENCES_ERRORS,
} from "./connections";
import {
  CHAT_DIRECT_ERRORS,
  CHAT_REQUEST_ERRORS,
  CHAT_SEND_CODES,
} from "./chatErrors";
import { FAQ_PROPOSAL_ERRORS } from "./faq";
import { OTP_REQUEST_ERRORS, OTP_VERIFY_ERRORS } from "./otp";
import { REDEEM_INVITE_CODES } from "./invites";
import { REPORT_ERRORS } from "./report";
import { STUDY_CREATE_ERRORS } from "./study";

type EndpointErrors = {
  statuses: Record<number, string>;
  /** backend error codes, checked before `statuses` when one status covers several errors */
  codes?: Record<string, string>;
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
  "/auth/invites/redeem": { statuses: {}, codes: REDEEM_INVITE_CODES },
  "/reports": { statuses: REPORT_ERRORS },
  "/chat/conversations/direct": { statuses: CHAT_DIRECT_ERRORS },
  "/chat/requests": { statuses: CHAT_REQUEST_ERRORS, codes: CHAT_SEND_CODES },
  "/chat/conversations/{id}/messages": { statuses: {}, codes: CHAT_SEND_CODES },
  "/connections/candidates/{id}": { statuses: CANDIDATE_ERRORS },
  "/connections/me": {
    statuses: CONNECTION_PREFERENCES_ERRORS,
    codes: CONNECTION_PREFERENCES_CODES,
  },
  "/study/courses": { statuses: STUDY_CREATE_ERRORS },
  "/study/courses/{id}/comments": { statuses: STUDY_CREATE_ERRORS },
  "/study/courses/{id}/files": { statuses: STUDY_CREATE_ERRORS },
  "/faq/proposals": {
    statuses: FAQ_PROPOSAL_ERRORS,
    fallback: "faq.proposalFailed",
  },
} satisfies Partial<Record<keyof paths, EndpointErrors>>;
