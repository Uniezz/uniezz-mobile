import { useEffect } from "react";
import { usePathname, useSegments } from "expo-router";
import { usePostHog } from "posthog-react-native";
import { countActionForReview } from "@/store";

export function useScreenTracking(): void {
  const posthog = usePostHog();
  const pathname = usePathname();
  const segments = useSegments();
  const screen = `/${segments.join("/")}`;

  useEffect(() => {
    // Route templates exclude IDs and login callback query parameters.
    posthog.screen(screen);
    // opening a post counts toward asking once for a store rating, like the actions in QueryProvider
    if (screen === "/post/[id]") countActionForReview();
  }, [posthog, screen, pathname]);
}
