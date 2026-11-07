import "@tanstack/react-query";

export type ActionOutcome =
  "attempted" | "succeeded" | "failed" | "cancelled" | "validation_failed";

export type ActionProperties = {
  storage?: "local";
};

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: { analyticsAction: string };
  }
}
