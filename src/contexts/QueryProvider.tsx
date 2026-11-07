import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePostHog } from "posthog-react-native";
import { createAnalyticsMutationCache } from "@/utils/analytics";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const posthog = usePostHog();
  const [queryClient] = useState(
    () =>
      new QueryClient({ mutationCache: createAnalyticsMutationCache(posthog) }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
