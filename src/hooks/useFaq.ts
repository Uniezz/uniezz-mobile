import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { createFaqProposal, getFaqEntries, getMyFaqProposals } from "@/api";
import { LANGUAGES } from "@/store/languageStore";

export function useFaqEntries() {
  const { i18n } = useTranslation();
  // the language is in the key, so switching it loads the FAQ in the new one
  const lang = LANGUAGES.find((code) => code === i18n.language) ?? "pl";
  return useInfiniteQuery({
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    queryKey: ["faq", "entries", lang],
    queryFn: ({ pageParam }) => getFaqEntries(lang, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
}

export function useMyFaqProposals() {
  return useInfiniteQuery({
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    queryKey: ["faq", "proposals"],
    queryFn: ({ pageParam }) => getMyFaqProposals(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
}

// a proposal waits for a moderator, so only the student's own proposals change
export function useCreateFaqProposal() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "faq_propose" },
    mutationFn: createFaqProposal,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["faq", "proposals"] }),
  });
}
