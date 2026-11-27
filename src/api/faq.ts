import type { FaqProposalInput } from "@/@types";
import type { Language } from "@/store/languageStore";
import { api } from "./client";

export async function getFaqEntries(lang: Language, cursor?: string) {
  const { data } = await api.GET("/faq", {
    params: { query: { cursor, limit: 20, lang } },
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
