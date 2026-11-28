import { useState } from "react";
import { AppState } from "react-native";
import {
  focusManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { usePostHog } from "posthog-react-native";
import {
  createAnalyticsMutationCache,
  REVIEW_ACTIONS,
  toastCoinsEarned,
} from "@/utils";
import { countActionForReview } from "@/store";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const posthog = usePostHog();
  const [queryClient] = useState(() => {
    // React Native has no window focus: returning from the background refetches stale data, e.g. a post made on the web
    focusManager.setEventListener((handleFocus) => {
      const subscription = AppState.addEventListener("change", (state) =>
        handleFocus(state === "active"),
      );
      return () => subscription.remove();
    });
    const mutationCache = createAnalyticsMutationCache(posthog);
    // one place for the "+N coins" toast, whichever mutation paid them;
    // PostHog reads its cached flags synchronously, so the latest value is right here
    mutationCache.subscribe((event) => {
      if (posthog.getFeatureFlag("coins") === false) return;
      if (event.type === "updated" && event.action.type === "success") {
        toastCoinsEarned(event.action.data);
      }
    });
    // what a student does on purpose counts toward asking once for a store rating
    mutationCache.subscribe((event) => {
      const action = event.mutation?.meta?.analyticsAction;
      if (
        event.type === "updated" &&
        event.action.type === "success" &&
        action &&
        REVIEW_ACTIONS.has(action)
      ) {
        return countActionForReview();
      }
    });
    return new QueryClient({ mutationCache });
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
