/// <reference types="node" />
import assert from "node:assert/strict";
import { test } from "node:test";

process.env.EXPO_PUBLIC_API_URL = "https://api.test";
process.env.EXPO_PUBLIC_PROJECT_TOKEN = "phc_test";

const { useChatStore } = await import("../src/store/chat");

const message = (conversationId: string, mine: boolean) => ({
  id: "message-1",
  conversationId,
  seq: 3,
  changeSeq: 3,
  sender: {
    id: mine ? "me" : "other",
    deleted: false,
    firstName: mine ? "Me" : "Other",
    lastName: "Student",
    avatarUrl: null,
    universityId: "umcs",
  },
  kind: "text" as const,
  body: "Live message",
  payload: {},
  clientId: null,
  attachments: [],
  createdAt: "2026-11-22T18:00:00.000Z",
  deletedAt: null,
});

test("adds live message to the open conversation without unread", () => {
  useChatStore.getState().reset();
  useChatStore.getState().setMyId("me");
  useChatStore.getState().setActiveConversation("direct-1");
  useChatStore.setState({
    conversations: [
      {
        id: "direct-1",
        name: "Other Student",
        preview: "Old",
        group: false,
        unread: 0,
        changeSeq: 2,
        lastSeq: 2,
        updatedAt: 1,
      },
    ],
  });

  useChatStore.getState().receiveMessage(message("direct-1", false));

  const state = useChatStore.getState();
  assert.equal(state.messages["direct-1"]?.[0]?.text, "Live message");
  assert.equal(state.conversations[0]?.preview, "Live message");
  assert.equal(state.conversations[0]?.unread, 0);
  assert.equal(state.conversations[0]?.lastSeq, 3);
});

test("increments unread for a live message outside the open chat", () => {
  useChatStore.getState().reset();
  useChatStore.getState().setMyId("me");
  useChatStore.setState({
    conversations: [
      {
        id: "direct-1",
        name: "Other Student",
        preview: "Old",
        group: false,
        unread: 2,
        changeSeq: 2,
        lastSeq: 2,
        updatedAt: 1,
      },
    ],
  });

  useChatStore.getState().receiveMessage(message("direct-1", false));

  assert.equal(useChatStore.getState().conversations[0]?.unread, 3);
});

test("removes a conversation from the chat list", () => {
  useChatStore.getState().reset();
  useChatStore.setState({
    conversations: [
      {
        id: "direct-1",
        name: "Other Student",
        preview: "Old",
        group: false,
        unread: 0,
        changeSeq: 2,
        lastSeq: 2,
        updatedAt: 1,
      },
    ],
  });

  useChatStore.getState().removeConversation("direct-1");

  assert.deepEqual(useChatStore.getState().conversations, []);
});
