import EventSource from "react-native-sse";
import { AppState } from "react-native";
import { useEffect, useRef } from "react";
import type { ApiChatMessage, ApiConversation } from "@/@types/chat";
import { getChatConversation, listChatConversations } from "@/api";
import { API_BASE_URL } from "@/api/client";
import { useChatStore } from "@/store/chat";
import { useMyProfile } from "@/hooks/useMyProfile";

type ChatSseEvent =
  | "ready"
  | "message.created"
  | "message.updated"
  | "conversation.updated"
  | "conversation.removed"
  | "read.updated"
  | "reconnect"
  | "auth_expired";

type JsonEvent = {
  data: string | null;
};

export function useChatLive(
  token: string | null,
  onAuthExpired: () => void,
): void {
  const sourceRef = useRef<EventSource<ChatSseEvent> | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data: profile } = useMyProfile();
  const setMyId = useChatStore((state) => state.setMyId);
  const loadConversations = useChatStore((state) => state.loadConversations);
  const catchUp = useChatStore((state) => state.catchUp);
  const upsertConversation = useChatStore((state) => state.upsertConversation);
  const removeConversation = useChatStore((state) => state.removeConversation);
  const receiveMessage = useChatStore((state) => state.receiveMessage);

  useEffect(() => {
    setMyId(profile?.id ?? null);
  }, [profile?.id, setMyId]);

  useEffect(() => {
    if (!token) {
      sourceRef.current?.close();
      sourceRef.current = null;
      return;
    }

    const parse = <T>(event: JsonEvent): T | null => {
      if (!event.data) return null;
      try {
        return JSON.parse(event.data) as T;
      } catch {
        return null;
      }
    };

    const catchUpFromServer = async () => {
      await loadConversations();
      let cursor: string | undefined;
      do {
        const page = await listChatConversations(cursor);
        for (const conversation of page.items) {
          const cached = useChatStore
            .getState()
            .conversations.find((item) => item.id === conversation.id);
          if (cached && cached.changeSeq < conversation.changeSeq) {
            await catchUp(conversation.id, cached.changeSeq);
          }
          upsertConversation(conversation);
        }
        cursor = page.nextCursor ?? undefined;
      } while (cursor);
    };

    const connect = () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      sourceRef.current?.close();
      const source = new EventSource<ChatSseEvent>(
        `${API_BASE_URL.replace(/\/$/, "")}/chat/stream`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 0,
          pollingInterval: 5000,
        },
      );
      sourceRef.current = source;

      source.addEventListener("open", () => {
        catchUpFromServer().catch(() => undefined);
      });
      source.addEventListener("ready", () => {
        catchUpFromServer().catch(() => undefined);
      });
      source.addEventListener("message.created", (event) => {
        const payload = parse<{
          conversationId: string;
          changeSeq: number;
          message: ApiChatMessage;
        }>(event);
        if (payload) receiveMessage(payload.message);
      });
      source.addEventListener("message.updated", (event) => {
        const payload = parse<{
          conversationId: string;
          changeSeq: number;
          message: ApiChatMessage;
        }>(event);
        if (payload) receiveMessage(payload.message);
      });
      source.addEventListener("conversation.updated", (event) => {
        const payload = parse<{
          conversationId: string;
          changeSeq: number;
        }>(event);
        if (!payload) return;
        getChatConversation(payload.conversationId)
          .then(upsertConversation)
          .catch(() => undefined);
      });
      source.addEventListener("conversation.removed", (event) => {
        const payload = parse<{ conversationId: string }>(event);
        if (payload) removeConversation(payload.conversationId);
      });
      source.addEventListener("read.updated", (event) => {
        const payload = parse<{
          conversationId: string;
          userId: string;
          lastReadSeq: number;
          unreadCount?: number;
        }>(event);
        if (!payload) return;
        if (payload.unreadCount !== undefined) {
          useChatStore.setState((state) => ({
            conversations: state.conversations.map((item) =>
              item.id === payload.conversationId
                ? {
                    ...item,
                    unread: payload.unreadCount as number,
                  }
                : item,
            ),
          }));
        }
      });
      source.addEventListener("reconnect", (event) => {
        const payload = parse<{ afterMs: number }>(event);
        const delay = payload?.afterMs ?? 5000;
        source.close();
        reconnectTimerRef.current = setTimeout(connect, delay);
      });
      source.addEventListener("auth_expired", () => {
        source.close();
        onAuthExpired();
      });
      source.addEventListener("error", () => {
        catchUpFromServer().catch(() => undefined);
      });
    };

    connect();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        catchUpFromServer().catch(() => undefined);
        if (!sourceRef.current) connect();
      }
    });

    return () => {
      subscription.remove();
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      sourceRef.current?.close();
      sourceRef.current = null;
    };
  }, [
    token,
    onAuthExpired,
    loadConversations,
    catchUp,
    upsertConversation,
    removeConversation,
    receiveMessage,
  ]);
}
