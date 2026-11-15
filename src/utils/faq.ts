import type { FaqEntry } from "@/@types";

export const FAQ_PROPOSAL_ERRORS: Record<number, string> = {
  422: "faq.proposalInvalid",
};

export const FAQ_STATUS_LABELS = {
  proposed: "faq.statusProposed",
  published: "faq.statusPublished",
  rejected: "faq.statusRejected",
} as const satisfies Record<FaqEntry["status"], string>;
