import { MutationCache } from "@tanstack/react-query";
import type PostHog from "posthog-react-native";
import type { ActionOutcome, ActionProperties } from "@/@types/analytics";

export function captureAction(
  posthog: Pick<PostHog, "capture">,
  action: string,
  outcome: ActionOutcome,
  properties?: ActionProperties,
): void {
  try {
    posthog.capture(`${action}_${outcome}`, properties);
  } catch {
    // Analytics must never interrupt the user's action.
  }
}

export function createAnalyticsMutationCache(
  posthog: Pick<PostHog, "capture">,
): MutationCache {
  return new MutationCache({
    onMutate: (_, mutation) => {
      captureAction(
        posthog,
        mutation.meta?.analyticsAction ?? "mutation",
        "attempted",
      );
    },
    onSuccess: (_, __, ___, mutation) => {
      captureAction(
        posthog,
        mutation.meta?.analyticsAction ?? "mutation",
        "succeeded",
      );
    },
    onError: (_, __, ___, mutation) => {
      captureAction(
        posthog,
        mutation.meta?.analyticsAction ?? "mutation",
        "failed",
      );
    },
  });
}
