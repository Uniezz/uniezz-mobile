import { useEffect } from "react";
import { usePathname, useSegments } from "expo-router";
import { usePostHog } from "posthog-react-native";

export function useScreenTracking(): void {
  const posthog = usePostHog();
  const pathname = usePathname();
  const segments = useSegments();
  const screen = `/${segments.join("/")}`;

  useEffect(() => {
    // Route templates exclude IDs and login callback query parameters.
    posthog.screen(screen);
  }, [posthog, screen, pathname]);
}
