/// <reference types="node" />
import assert from "node:assert/strict";
import { test } from "node:test";
import { useChatStore } from "../src/store/chat";

test("creates a member-only group and sends a visible message", () => {
  useChatStore.getState().reset();
  const id = useChatStore.getState().createGroup("Study group", ["a", "b"]);

  const group = useChatStore
    .getState()
    .conversations.find((item) => item.id === id);
  assert.equal(group?.group, true);
  assert.equal(group?.isMember, true);
  assert.equal(useChatStore.getState().sendMessage(id, "Hello group"), true);
  assert.equal(
    useChatStore.getState().messages[id]?.at(-1)?.text,
    "Hello group",
  );
  assert.equal(
    useChatStore.getState().conversations.find((item) => item.id === id)
      ?.preview,
    "Hello group",
  );
});

test("does not send or expose an existing non-member group thread", () => {
  useChatStore.getState().reset();

  const erasmus = useChatStore
    .getState()
    .conversations.find((item) => item.id === "erasmus");
  assert.equal(erasmus?.group, true);
  assert.equal(erasmus?.isMember, false);
  assert.equal(useChatStore.getState().sendMessage("erasmus", "Hello"), false);
  assert.equal(useChatStore.getState().messages.erasmus, undefined);
});
