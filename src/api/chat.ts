import type { CreateChatGroupInput, SendChatMessageInput } from "@/@types";
import { api } from "./client";
// the file, not the @/utils barrel: utils/apiErrorKey imports @/api, so the barrel would cycle
import * as fixtures from "@/utils/chatFixtures";

// shortcut: /chat exists only on the backend's feat/chat-core branch, so every call answers from
// in-memory fixtures; set false once it is deployed, then delete utils/chatFixtures.ts and these checks
const USE_CHAT_FIXTURES: boolean = true;

// newest activity first
export async function getChatConversations(cursor?: string) {
  if (USE_CHAT_FIXTURES) return fixtures.listConversations();
  const { data } = await api.GET("/chat/conversations", {
    params: { query: { cursor, limit: 20 } },
  });

  return data!;
}

export async function getChatConversation(id: string) {
  if (USE_CHAT_FIXTURES) return fixtures.getConversation(id);
  const { data } = await api.GET("/chat/conversations/{id}", {
    params: { path: { id } },
  });

  return data!;
}

// returns the existing direct conversation with the student, or starts one
export async function openDirectConversation(userId: string) {
  if (USE_CHAT_FIXTURES) return fixtures.openDirectConversation(userId);
  const { data } = await api.POST("/chat/conversations/direct", {
    body: { userId },
  });

  return data!;
}

export async function createGroupConversation({
  body,
  key,
}: {
  body: CreateChatGroupInput;
  key: string;
}) {
  if (USE_CHAT_FIXTURES) return fixtures.createGroupConversation(body);
  const { data } = await api.POST("/chat/conversations/groups", {
    params: { header: { "Idempotency-Key": key } },
    body,
  });

  return data!;
}

export async function renameChatConversation({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  if (USE_CHAT_FIXTURES) return fixtures.renameConversation(id, name);
  const { data } = await api.PATCH("/chat/conversations/{id}", {
    params: { path: { id } },
    body: { name },
  });

  return data!;
}

export async function getChatMembers(id: string, cursor?: string) {
  if (USE_CHAT_FIXTURES) return fixtures.listMembers(id);
  const { data } = await api.GET("/chat/conversations/{id}/members", {
    params: { path: { id }, query: { cursor, limit: 50 } },
  });

  return data!;
}

export async function addChatMembers({
  id,
  userIds,
}: {
  id: string;
  userIds: string[];
}) {
  if (USE_CHAT_FIXTURES) return fixtures.addMembers(id, userIds);
  const { data } = await api.POST("/chat/conversations/{id}/members", {
    params: { path: { id } },
    body: { userIds },
  });

  return data!;
}

export async function leaveChatConversation(id: string) {
  if (USE_CHAT_FIXTURES) return fixtures.leaveConversation(id);
  await api.DELETE("/chat/conversations/{id}/members/me", {
    params: { path: { id } },
  });
}

export async function removeChatMember({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) {
  if (USE_CHAT_FIXTURES) return fixtures.removeMember(id, userId);
  await api.DELETE("/chat/conversations/{id}/members/{userId}", {
    params: { path: { id, userId } },
  });
}

// the read position only moves forward
export async function markChatRead({ id, seq }: { id: string; seq: number }) {
  if (USE_CHAT_FIXTURES) return fixtures.markRead(id, seq);
  const { data } = await api.PUT("/chat/conversations/{id}/read", {
    params: { path: { id } },
    body: { seq },
  });

  return data!;
}

export async function getChatUnread() {
  if (USE_CHAT_FIXTURES) return fixtures.getUnread();
  const { data } = await api.GET("/chat/unread");

  return data!;
}

// history mode: newest first by seq
export async function getChatMessages(id: string, cursor?: string) {
  if (USE_CHAT_FIXTURES) return fixtures.listMessages(id);
  const { data } = await api.GET("/chat/conversations/{id}/messages", {
    params: { path: { id }, query: { cursor, limit: 30 } },
  });

  return data!;
}

// a retry with the same key returns the stored message instead of sending twice
export async function sendChatMessage({
  id,
  body,
  key,
}: {
  id: string;
  body: SendChatMessageInput;
  key: string;
}) {
  if (USE_CHAT_FIXTURES) return fixtures.sendMessage(id, body, key);
  const { data } = await api.POST("/chat/conversations/{id}/messages", {
    params: { path: { id }, header: { "Idempotency-Key": key } },
    body,
  });

  return data!;
}

export async function deleteChatMessage(id: string) {
  if (USE_CHAT_FIXTURES) return fixtures.deleteMessage(id);
  await api.DELETE("/chat/messages/{id}", {
    params: { path: { id } },
  });
}
