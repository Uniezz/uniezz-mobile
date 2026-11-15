import { useState } from "react";
import { AppState } from "react-native";
import {
  focusManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { usePostHog } from "posthog-react-native";
import { createAnalyticsMutationCache, toastCoinsEarned } from "@/utils";

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
    // one place for the "+N coins" toast, whichever mutation paid them
    mutationCache.subscribe((event) => {
      if (event.type === "updated" && event.action.type === "success") {
        toastCoinsEarned(event.action.data);
      }
    });
    return new QueryClient({ mutationCache });
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
