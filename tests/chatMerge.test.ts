/// <reference types="node" />
import assert from "node:assert/strict";
import { test } from "node:test";
import { QueryClient } from "@tanstack/react-query";
import type { ApiChatMessage } from "../src/@types";

process.env.EXPO_PUBLIC_API_URL = "https://api.test";
process.env.EXPO_PUBLIC_PROJECT_TOKEN = "phc_test";

const { mergeChatMessages } = await import("../src/utils/chat");

const key = [
  "get",
  "/chat/conversations/{id}/messages",
  { params: { path: { id: "c" }, query: { limit: 30 } } },
];

const message = (seq: number, body = `m${seq}`): ApiChatMessage => ({
  id: `c-${seq}`,
  conversationId: "c",
  seq,
  changeSeq: seq,
  kind: "text",
  body,
  attachments: null,
  clientId: null,
  createdAt: new Date(seq * 1000).toISOString(),
  deletedAt: null,
  payload: {},
  sender: {
    id: "s",
    firstName: "S",
    lastName: null,
    avatarUrl: null,
    deleted: false,
    universityId: "umcs",
  },
});

// two loaded pages, newest first: [5, 4] and [3, 2]
const setup = () => {
  const queryClient = new QueryClient();
  queryClient.setQueryData(key, {
    pages: [
      { items: [message(5), message(4)], nextCursor: "p2" },
      { items: [message(3), message(2)], nextCursor: null },
    ],
    pageParams: [null, "p2"],
  });
  const seqs = () =>
    (
      queryClient.getQueryData(key) as {
        pages: { items: ApiChatMessage[] }[];
      }
    ).pages.map((page) => page.items.map(({ seq, body }) => `${seq}:${body}`));
  return { queryClient, seqs };
};

test("newer messages join the first page in order, once each", () => {
  const { queryClient, seqs } = setup();

  mergeChatMessages(queryClient, "c", [message(7), message(6)]);
  mergeChatMessages(queryClient, "c", [message(7)]);

  assert.deepEqual(seqs(), [
    ["7:m7", "6:m6", "5:m5", "4:m4"],
    ["3:m3", "2:m2"],
  ]);
});

test("a changed message is replaced where it is, on any page", () => {
  const { queryClient, seqs } = setup();

  mergeChatMessages(queryClient, "c", [message(3, "edited")]);

  assert.deepEqual(seqs(), [
    ["5:m5", "4:m4"],
    ["3:edited", "2:m2"],
  ]);
});

test("an older message the pages never loaded stays out", () => {
  const { queryClient, seqs } = setup();

  mergeChatMessages(queryClient, "c", [message(1)]);

  assert.deepEqual(seqs(), [
    ["5:m5", "4:m4"],
    ["3:m3", "2:m2"],
  ]);
});

const { pendingChatMessage, removeChatMessage } =
  await import("../src/utils/chat");

const pending = (key: string, text: string) =>
  pendingChatMessage({
    conversationId: "c",
    key,
    text,
    photos: [],
    sender: message(0).sender,
  });

test("a pending message shows on top and the stored one takes its place by clientId", () => {
  const { queryClient, seqs } = setup();

  mergeChatMessages(queryClient, "c", [pending("k1", "hi")]);
  // someone else's message arrives while it is pending: it still joins, below the pending one
  mergeChatMessages(queryClient, "c", [message(6)]);
  // the stream may deliver the stored message before the mutation answers; it replaces, once
  const stored = { ...message(7, "hi"), clientId: "k1" };
  mergeChatMessages(queryClient, "c", [stored]);
  mergeChatMessages(queryClient, "c", [stored]);

  assert.deepEqual(seqs()[0], ["7:hi", "6:m6", "5:m5", "4:m4"]);
});

test("a failed pending message leaves the thread", () => {
  const { queryClient, seqs } = setup();

  mergeChatMessages(queryClient, "c", [pending("k2", "lost")]);
  removeChatMessage(queryClient, "c", "pending:k2");

  assert.deepEqual(seqs()[0], ["5:m5", "4:m4"]);
});
