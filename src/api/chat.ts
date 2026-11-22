import type {
  ApiChatMessage,
  ApiConversation,
  SendChatMessageInput,
} from "@/@types/chat";
import { api } from "./client";

export async function listChatConversations(
  cursor?: string,
): Promise<{ items: ApiConversation[]; nextCursor: string | null }> {
  const { data } = await api.GET("/chat/conversations", {
    params: { query: { cursor, limit: 50 } },
  });
  return {
    items: data!.items ?? [],
    nextCursor: data!.nextCursor,
  };
}

export async function getChatConversation(
  id: string,
): Promise<ApiConversation> {
  const { data } = await api.GET("/chat/conversations/{id}", {
    params: { path: { id } },
  });
  return data!;
}

export async function listChatMessages(
  id: string,
  options: { cursor?: string; changedAfter?: string } = {},
): Promise<{ items: ApiChatMessage[]; nextCursor: string | null }> {
  const { data } = await api.GET("/chat/conversations/{id}/messages", {
    params: {
      path: { id },
      query: { limit: 50, ...options },
    },
  });
  return {
    items: data!.items ?? [],
    nextCursor: data!.nextCursor,
  };
}

export async function sendChatMessage(
  id: string,
  body: SendChatMessageInput,
  idempotencyKey: string,
): Promise<ApiChatMessage> {
  const { data } = await api.POST("/chat/conversations/{id}/messages", {
    params: {
      path: { id },
      header: { "Idempotency-Key": idempotencyKey },
    },
    body,
  });
  return data!;
}

export async function markChatRead(
  id: string,
  seq: number,
): Promise<{ lastReadSeq: number; unreadCount: number }> {
  const { data } = await api.PUT("/chat/conversations/{id}/read", {
    params: { path: { id } },
    body: { seq },
  });
  return data!;
}
