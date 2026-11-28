/// <reference types="node" />
import assert from "node:assert/strict";
import { test } from "node:test";
import type { TFunction } from "i18next";
import type { ApiChatMessage } from "../src/@types";

process.env.EXPO_PUBLIC_API_URL = "https://api.test";
process.env.EXPO_PUBLIC_PROJECT_TOKEN = "phc_test";

const { chatMessageText } = await import("../src/utils/chat");

// echoes the key and its values, so a test reads what the screen would translate
const t = ((key: string, values?: Record<string, unknown>) =>
  values ? `${key} ${JSON.stringify(values)}` : key) as unknown as TFunction;

const system = (
  event: string,
  params: Record<string, unknown>,
  deleted = false,
): ApiChatMessage => ({
  id: "m",
  conversationId: "c",
  seq: 1,
  changeSeq: 1,
  kind: "system",
  body: null,
  attachments: null,
  clientId: null,
  createdAt: new Date(0).toISOString(),
  deletedAt: null,
  payload: { event, actorId: "a", params },
  sender: {
    id: deleted ? null : "a",
    firstName: deleted ? null : "Ana",
    lastName: null,
    avatarUrl: null,
    deleted,
    universityId: null,
  },
});

const names = new Map([["b", "Bob"]]);

test("system messages name who did what from their payload", () => {
  assert.equal(
    chatMessageText(system("renamed", { name: "Study" }), t, names),
    'chat.systemRenamed {"name":"Ana","title":"Study"}',
  );
  // an id the members list lacks reads as "someone"
  assert.equal(
    chatMessageText(system("member_added", { userIds: ["b", "x"] }), t, names),
    'chat.systemMemberAdded {"name":"Ana","names":"Bob, chat.someone"}',
  );
  assert.equal(
    chatMessageText(system("owner_changed", { userId: "b" }), t, names),
    'chat.systemOwnerChanged {"target":"Bob"}',
  );
});

test("a deleted account and an unknown event fall back", () => {
  assert.equal(
    chatMessageText(system("member_left", {}, true), t),
    'chat.systemMemberLeft {"name":"chat.deletedAccount"}',
  );
  assert.equal(chatMessageText(system("pinned", {}), t), "chat.systemOther");
});
