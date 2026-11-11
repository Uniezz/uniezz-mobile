import type { FaqProposalInput } from "@/@types/faq";
import { api } from "./client";

export async function getFaqEntries(cursor?: string) {
  const { data } = await api.GET("/faq", {
    params: { query: { cursor, limit: 20 } },
  });

  return data!;
}

export async function createFaqProposal(body: FaqProposalInput) {
  const { data } = await api.POST("/faq/proposals", { body });

  return data!;
}
