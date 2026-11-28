/// <reference types="node" />
import assert from "node:assert/strict";
import { test } from "node:test";
import { redirectSystemPath } from "../src/app/+native-intent";
import { canRedeemInvite } from "../src/utils/invites";

const DAY = 24 * 60 * 60_000;

test("an invite code can be redeemed only in an account's first 7 days", () => {
  const now = Date.parse("2026-11-15T12:00:00Z");
  assert.equal(
    canRedeemInvite(new Date(now - 6 * DAY).toISOString(), now),
    true,
  );
  assert.equal(
    canRedeemInvite(new Date(now - 7 * DAY).toISOString(), now),
    false,
  );
});

test("invite links open the invite screen, whatever the session", () => {
  for (const path of [
    "https://uniezz.pl/invite/A1B2C3D",
    "/invite/A1B2C3D",
    "uniezz://invite/A1B2C3D",
  ]) {
    assert.equal(
      redirectSystemPath({ path, initial: true }),
      "/invite/A1B2C3D",
      path,
    );
  }
  assert.equal(
    redirectSystemPath({ path: "/invite/short", initial: true }),
    "/invite/short",
  );
});

test("shared web pages open their app screen", () => {
  const id = "0b6f5b8e-2f0a-4c55-9a39-5d3c1e7f2a10";
  for (const [path, route] of [
    [`https://uniezz.pl/feed/post/${id}`, `/post/${id}`],
    [`https://uniezz.pl/connections/students/${id}`, `/student/${id}`],
    [`https://uniezz.pl/exams/courses/${id}`, `/course/${id}`],
    [`https://uniezz.pl/feed/post/${id}/edit`, `/post/${id}`],
    [`https://uniezz.pl/exams/courses/${id}/upload`, `/course/${id}`],
    ["https://uniezz.pl/exams/courses/new", "/"],
  ] as const) {
    assert.equal(redirectSystemPath({ path, initial: true }), route, path);
  }
});
