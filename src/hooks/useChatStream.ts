import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { AppState } from "react-native";
import EventSource from "react-native-sse";
import type { ChatStreamEvent } from "@/@types";
import { API_BASE_URL } from "@/api";
import { useSession } from "@/contexts";
import {
  chatKeys,
  forgetChatConversation,
  refetchChatConversation,
} from "@/utils";

type ChatEventName = ChatStreamEvent["event"];

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
        // the stream is no delivery guarantee: every (re)connect catches up on every chat query
        case "ready":
          return queryClient.invalidateQueries({
            predicate: ({ queryKey }) =>
              String(queryKey[1]).startsWith("/chat/"),
          });
        // anything in one conversation: it goes stale, and what is on screen refetches
        case "message.created":
        case "message.updated":
        case "read.updated":
        case "conversation.updated":
          return refetchChatConversation(
            queryClient,
            event.data.conversationId,
          );
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
