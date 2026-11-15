import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePostHog } from "posthog-react-native";
import { createAnalyticsMutationCache, toastCoinsEarned } from "@/utils";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const posthog = usePostHog();
  const [queryClient] = useState(() => {
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
