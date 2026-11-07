/// <reference types="node" />
import assert from "node:assert/strict";
import { test } from "node:test";
import { QueryClient } from "@tanstack/react-query";
import {
  captureAction,
  createAnalyticsMutationCache,
} from "../src/utils/analytics";

test("tracks attempts and results without mutation inputs, results, or errors", async () => {
  const events: unknown[][] = [];
  const cache = createAnalyticsMutationCache({
    capture: (...args) => {
      events.push(args);
    },
  });
  const client = new QueryClient({ mutationCache: cache });
  const success = cache.build(client, {
    meta: { analyticsAction: "otp_verify" },
    mutationFn: async (_: { code: string }) => ({ token: "secret-token" }),
  });
  await success.execute({ code: "123456" });
  const failure = cache.build(client, {
    meta: { analyticsAction: "post_create" },
    mutationFn: async (_: { content: string }) => {
      throw new Error("private response");
    },
  });
  await assert.rejects(failure.execute({ content: "private post" }));
  assert.deepEqual(events, [
    ["otp_verify_attempted", undefined],
    ["otp_verify_succeeded", undefined],
    ["post_create_attempted", undefined],
    ["post_create_failed", undefined],
  ]);
  client.clear();
});

test("automatic retry produces one action attempt and one final outcome", async () => {
  const events: string[] = [];
  const cache = createAnalyticsMutationCache({
    capture: (event) => {
      events.push(event);
    },
  });
  const client = new QueryClient({ mutationCache: cache });
  let attempts = 0;
  const mutation = cache.build(client, {
    meta: { analyticsAction: "images_upload" },
    retry: 1,
    retryDelay: 0,
    mutationFn: async () => {
      if (++attempts === 1) throw new Error("network failure");
      return "uploaded";
    },
  });
  await mutation.execute(undefined);
  assert.equal(attempts, 2);
  assert.deepEqual(events, [
    "images_upload_attempted",
    "images_upload_succeeded",
  ]);
  client.clear();
});

test("analytics failures cannot change the result of an action", async () => {
  const posthog = {
    capture: () => {
      throw new Error("analytics unavailable");
    },
  };
  const cache = createAnalyticsMutationCache(posthog);
  const client = new QueryClient({ mutationCache: cache });
  const success = cache.build(client, { mutationFn: async () => "saved" });
  assert.equal(await success.execute(undefined), "saved");
  const original = new Error("original failure");
  const failure = cache.build(client, {
    mutationFn: async () => {
      throw original;
    },
  });
  await assert.rejects(
    failure.execute(undefined),
    (error) => error === original,
  );
  assert.doesNotThrow(() => captureAction(posthog, "photos_pick", "cancelled"));
  assert.doesNotThrow(() =>
    captureAction(posthog, "post_form", "validation_failed"),
  );
  client.clear();
});
