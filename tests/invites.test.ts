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
