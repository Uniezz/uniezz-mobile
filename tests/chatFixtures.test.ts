/// <reference types="node" />
import assert from "node:assert/strict";
import { test } from "node:test";

process.env.EXPO_PUBLIC_API_URL = "https://api.test";
process.env.EXPO_PUBLIC_PROJECT_TOKEN = "phc_test";

const chat = await import("../src/api/chat");

test("sending moves the conversation to the top and reads it up to the new message", async () => {
  const sent = await chat.sendChatMessage({
    id: "erasmus",
    body: { body: "Count me in" },
    key: "key-1",
  });
  const { items } = await chat.getChatConversations();
  const { items: messages } = await chat.getChatMessages("erasmus");

  assert.equal(items?.[0]?.id, "erasmus");
  assert.equal(items?.[0]?.lastSeq, sent.seq);
  assert.equal(items?.[0]?.unreadCount, 0);
  // history is newest first
  assert.equal(messages?.[0]?.body, "Count me in");
});

test("marking read only moves forward and never past the last message", async () => {
  const { lastSeq } = await chat.getChatConversation("kateryna");

  assert.deepEqual(await chat.markChatRead({ id: "kateryna", seq: 999 }), {
    lastReadSeq: lastSeq,
    unreadCount: 0,
  });
  assert.deepEqual(await chat.markChatRead({ id: "kateryna", seq: 0 }), {
    lastReadSeq: lastSeq,
    unreadCount: 0,
  });
});

test("a deleted message stays as an empty tombstone", async () => {
  await chat.deleteChatMessage("taras-1");
  const { items } = await chat.getChatMessages("taras");

  assert.equal(items?.length, 1);
  assert.equal(items?.[0]?.body, null);
  assert.ok(items?.[0]?.deletedAt);
});

test("leaving removes the conversation, and reading it then fails with 404", async () => {
  await chat.leaveChatConversation("mechatronika");
  const { items } = await chat.getChatConversations();
  const error = await chat
    .getChatConversation("mechatronika")
    .catch((reason: { status?: number }) => reason);

  assert.ok(!items?.some((item) => item.id === "mechatronika"));
  assert.equal((error as { status?: number }).status, 404);
});
