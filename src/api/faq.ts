import type { FaqProposalInput } from "@/@types";
import { api } from "./client";

export async function getFaqEntries(cursor?: string) {
  const { data } = await api.GET("/faq", {
    params: { query: { cursor, limit: 20 } },
  });

  return data!;
}

export async function getMyFaqProposals(cursor?: string) {
  const { data } = await api.GET("/faq/proposals", {
    params: { query: { cursor, limit: 20 } },
  });

  return data!;
}

export async function createFaqProposal(body: FaqProposalInput) {
  const { data } = await api.POST("/faq/proposals", { body });

  return data!;
}

export async function getPendingFaqProposals(cursor?: string) {
  const { data } = await api.GET("/faq/proposals/pending", {
    params: { query: { cursor, limit: 20 } },
  });

  return data!;
}

export async function approveFaqProposal(id: string) {
  const { data } = await api.PUT("/faq/proposals/{id}/approval", {
    params: { path: { id } },
  });

  return data!;
}
