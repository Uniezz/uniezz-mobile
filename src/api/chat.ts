import type { ApiChatMessage, SendChatMessageInput } from "@/@types";
import { api } from "./client";

// the rest of chat goes through openapi-react-query hooks (src/hooks/useChat.ts); these run inside
// larger steps: a catch-up through every page, and a send after its photos upload

// catch-up mode: everything created or changed after a changeSeq, deleted messages included,
// oldest change first, read through every page
export async function getChatMessageChanges(id: string, changedAfter: number) {
  const changes: ApiChatMessage[] = [];
  let cursor: string | undefined;
  do {
    const { data } = await api.GET("/chat/conversations/{id}/messages", {
      params: {
        path: { id },
        query: { changedAfter: String(changedAfter), cursor, limit: 50 },
      },
    });
    changes.push(...(data!.items ?? []));
    cursor = data!.nextCursor ?? undefined;
  } while (cursor);
  return changes;
}

// a retry with the same key and body returns the stored message instead of sending twice
export async function sendChatMessage(
  id: string,
  body: SendChatMessageInput,
  key: string,
) {
  const { data } = await api.POST("/chat/conversations/{id}/messages", {
    params: { path: { id }, header: { "Idempotency-Key": key } },
    body,
  });

  return data!;
}
