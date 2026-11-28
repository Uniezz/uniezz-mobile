import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { AppState } from "react-native";
import EventSource from "react-native-sse";
import type { ChatStreamEvent, Profile } from "@/@types";
import { API_BASE_URL } from "@/api";
import { useSession } from "@/contexts";
import {
  catchUpChatThread,
  chatKeys,
  forgetChatConversation,
  refetchChatConversation,
} from "@/utils";

type ChatEventName = ChatStreamEvent["event"];

// the conversation id inside a messages query key: [method, path, { params: { path: { id } } }]
const chatThreadId = (queryKey: readonly unknown[]) =>
  String(
    (queryKey[2] as { params?: { path?: { id?: string } } } | undefined)?.params
      ?.path?.id,
  );

const CHAT_EVENTS: ChatEventName[] = [
  "ready",
  "message.created",
  "message.updated",
  "conversation.updated",
  "conversation.removed",
  "read.updated",
  "reconnect",
  "auth_expired",
];

// keeps GET /chat/stream open while the app is in the foreground and marks what an event changed stale,
// so what is on screen refetches; react-native-sse parses the frames and reconnects on its own after a drop.
// shortcut: events refetch instead of writing their data into the cache; patch the cache if the requests cost too much
export function useChatStream(isEnabled: boolean) {
  const queryClient = useQueryClient();
  const { session } = useSession();
  const token = session?.token;

  useEffect(() => {
    if (!isEnabled || !token) return;
    const source = new EventSource<ChatEventName>(
      `${API_BASE_URL}/chat/stream`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

    const handleEvent = (event: ChatStreamEvent) => {
      switch (event.event) {
        // the stream is no delivery guarantee: every (re)connect catches up. Loaded threads ask only
        // for what changed (changedAfter); the other chat queries go stale and what is on screen refetches
        case "ready": {
          const messagesPath = chatKeys.messages("")[1];
          queryClient.invalidateQueries({
            predicate: ({ queryKey }) =>
              String(queryKey[1]).startsWith("/chat/") &&
              queryKey[1] !== messagesPath,
          });
          const threadIds = queryClient
            .getQueryCache()
            .findAll({ queryKey: ["get", messagesPath] })
            .map(({ queryKey }) => chatThreadId(queryKey));
          return Promise.all(
            [...new Set(threadIds)].map((id) =>
              catchUpChatThread(queryClient, id),
            ),
          );
        }
        // anything in one conversation: its thread catches up, the rest of it refetches where shown
        case "message.created":
        case "message.updated":
        case "conversation.updated":
          return refetchChatConversation(
            queryClient,
            event.data.conversationId,
          );
        // the other student read the chat: kept for the "Read" mark, it changes nothing else
        case "read.updated": {
          const { conversationId, userId, lastReadSeq } = event.data;
          const myId = queryClient.getQueryData<Profile>(["profile", "me"])?.id;
          if (userId === myId) {
            return refetchChatConversation(queryClient, conversationId);
          }
          return queryClient.setQueryData<number>(
            chatKeys.peerRead(conversationId),
            (current) => Math.max(current ?? 0, lastReadSeq),
          );
        }
        case "conversation.removed":
          return forgetChatConversation(queryClient, event.data.conversationId);
        // the server is restarting and says when to come back
        case "reconnect":
          source.close();
          reconnectTimer = setTimeout(() => source.open(), event.data.afterMs);
          return;
        // the session ended: stop, and let the next API call's 401 sign the student out
        case "auth_expired":
          source.close();
          return queryClient.invalidateQueries({ queryKey: chatKeys.unread });
      }
    };

    for (const name of CHAT_EVENTS) {
      source.addEventListener(name, ({ data }) => {
        try {
          handleEvent({
            event: name,
            data: data ? JSON.parse(data) : {},
          } as ChatStreamEvent);
        } catch {
          // a frame with broken JSON is dropped; the catch-up after the next reconnect covers it
        }
      });
    }
    // a rejected token stays rejected, so polling again would only hammer the API
    source.addEventListener("error", (event) => {
      if ("xhrStatus" in event && event.xhrStatus === 401) source.close();
    });

    // a stream in the background only drains the battery and counts toward the 5-stream limit
    let isPaused = AppState.currentState !== "active";
    if (isPaused) source.close();
    const subscription = AppState.addEventListener("change", (state) => {
      const isActive = state === "active";
      if (isActive === !isPaused) return;
      isPaused = !isActive;
      clearTimeout(reconnectTimer);
      if (isActive) source.open();
      else source.close();
    });

    return () => {
      clearTimeout(reconnectTimer);
      subscription.remove();
      source.removeAllEventListeners();
      source.close();
    };
  }, [isEnabled, token, queryClient]);
}
