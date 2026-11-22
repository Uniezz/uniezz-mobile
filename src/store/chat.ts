import { create } from "zustand";
import type {
  ApiChatMessage,
  ApiConversation,
  ChatStore,
  ChatMessage,
  Conversation,
} from "@/@types";
import {
  listChatConversations,
  listChatMessages,
  markChatRead,
  sendChatMessage,
} from "@/api";
import { idempotencyKey } from "@/utils/id";

let nextGroupId = 1;

const studentName = (student: ApiConversation["peer"]): string => {
  if (!student) return "";
  return [student.firstName, student.lastName].filter(Boolean).join(" ");
};

const normalizeConversation = (
  conversation: ApiConversation,
): Conversation => ({
  id: conversation.id,
  name:
    conversation.kind === "group"
      ? (conversation.name ?? "")
      : studentName(conversation.peer) || "Student",
  preview: conversation.lastMessage?.body ?? "",
  group: conversation.kind === "group",
  unread: conversation.unreadCount,
  changeSeq: conversation.changeSeq,
  lastSeq: conversation.lastSeq,
  updatedAt: conversation.lastMessage
    ? Date.parse(conversation.lastMessage.createdAt)
    : Date.parse(conversation.createdAt),
});

const normalizeMessage = (
  message: ApiChatMessage,
  myId: string | null,
): ChatMessage => ({
  id: message.id,
  text: message.body ?? "",
  createdAt: Date.parse(message.createdAt),
  mine: Boolean(myId && message.sender.id === myId),
});

export const useChatStore = create<ChatStore>((set, get) => ({
  myId: null,
  activeConversationId: null,
  conversations: [],
  messages: {},
  setMyId: (id) => set({ myId: id }),
  setActiveConversation: (id) => set({ activeConversationId: id }),
  loadConversations: async () => {
    let cursor: string | undefined;
    const conversations: ApiConversation[] = [];
    do {
      const page = await listChatConversations(cursor);
      conversations.push(...page.items);
      cursor = page.nextCursor ?? undefined;
    } while (cursor);
    set({ conversations: conversations.map(normalizeConversation) });
  },
  loadMessages: async (id) => {
    const first = await listChatMessages(id);
    set((state) => ({
      messages: {
        ...state.messages,
        [id]: first.items
          .map((message) => normalizeMessage(message, state.myId))
          .reverse(),
      },
    }));
  },
  catchUp: async (id, changedAfter) => {
    let cursor: string | undefined;
    const changed: ApiChatMessage[] = [];
    do {
      const page = await listChatMessages(id, {
        changedAfter: String(changedAfter),
        cursor,
      });
      changed.push(...page.items);
      cursor = page.nextCursor ?? undefined;
    } while (cursor);
    set((state) => {
      const current = state.messages[id] ?? [];
      const byId = new Map(current.map((message) => [message.id, message]));
      changed.forEach((message) =>
        byId.set(message.id, normalizeMessage(message, state.myId)),
      );
      return {
        messages: {
          ...state.messages,
          [id]: Array.from(byId.values()).sort(
            (a, b) => a.createdAt - b.createdAt,
          ),
        },
      };
    });
  },
  markRead: async (id, seq) => {
    const result = await markChatRead(id, seq);
    set((state) => ({
      conversations: state.conversations.map((item) =>
        item.id === id
          ? {
              ...item,
              unread: result.unreadCount,
              lastSeq: Math.max(item.lastSeq, seq),
            }
          : item,
      ),
    }));
  },
  upsertConversation: (conversation) =>
    set((state) => ({
      conversations: [
        normalizeConversation(conversation),
        ...state.conversations.filter((item) => item.id !== conversation.id),
      ].sort((a, b) => b.updatedAt - a.updatedAt),
    })),
  removeConversation: (id) =>
    set((state) => ({
      conversations: state.conversations.filter((item) => item.id !== id),
      messages: Object.fromEntries(
        Object.entries(state.messages).filter(
          ([messageId]) => messageId !== id,
        ),
      ),
    })),
  receiveMessage: (message) =>
    set((state) => {
      const current = state.messages[message.conversationId] ?? [];
      const exists = current.some((item) => item.id === message.id);
      const messages = exists
        ? current.map((item) =>
            item.id === message.id
              ? normalizeMessage(message, state.myId)
              : item,
          )
        : [...current, normalizeMessage(message, state.myId)];
      const conversation = state.conversations.find(
        (item) => item.id === message.conversationId,
      );
      const conversations = conversation
        ? state.conversations
            .map((item) =>
              item.id === message.conversationId
                ? {
                    ...item,
                    preview: message.body ?? "",
                    lastSeq: Math.max(item.lastSeq, message.seq),
                    changeSeq: Math.max(item.changeSeq, message.changeSeq),
                    unread:
                      state.activeConversationId === message.conversationId
                        ? 0
                        : item.unread +
                          (message.sender.id === state.myId ? 0 : 1),
                    updatedAt: Date.parse(message.createdAt),
                  }
                : item,
            )
            .sort((a, b) => b.updatedAt - a.updatedAt)
        : state.conversations;
      return {
        conversations,
        messages: { ...state.messages, [message.conversationId]: messages },
      };
    }),
  createGroup: (name, members) => {
    const id = `group-${nextGroupId++}`;
    set((state) => ({
      conversations: [
        {
          id,
          name,
          preview: `${members.length} members`,
          group: true,
          unread: 0,
          changeSeq: 0,
          lastSeq: 0,
          updatedAt: Date.now(),
        },
        ...state.conversations,
      ],
    }));
    return id;
  },
  // messages are kept oldest first, the order the thread shows them
  sendMessage: async (id, text) => {
    const key = idempotencyKey();
    const message = await sendChatMessage(
      id,
      { body: text, attachmentIds: [] },
      key,
    );
    get().receiveMessage(message);
  },
  reset: () => {
    nextGroupId = 1;
    set({
      myId: null,
      activeConversationId: null,
      conversations: [],
      messages: {},
    });
  },
}));
