import type { ApiChatMessage } from "@/@types";
import { api } from "./client";

// the rest of chat goes through openapi-react-query hooks (src/hooks/useChat.ts); this one runs
// outside React, from the stream, and pages through every change at once

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
