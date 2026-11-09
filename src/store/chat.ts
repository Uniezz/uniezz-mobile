import { create } from "zustand";
import type { ChatStore } from "@/@types/chat";
import { idempotencyKey } from "@/utils";

let nextGroupId = 1;
const MINUTE = 60 * 1000;

const initialConversations = [
  {
    id: "kateryna",
    name: "Kateryna Melnyk",
    preview: "See you after class!",
    group: false,
    unread: 2,
    updatedAt: Date.now() - 2 * MINUTE,
  },
  {
    id: "mechatronika",
    name: "Mechatronika, sem 5",
    preview: "Who has the notes?",
    group: true,
    unread: 1,
    updatedAt: Date.now() - 18 * MINUTE,
  },
  {
    id: "taras",
    name: "Taras Hnatiuk",
    preview: "Thanks for the help",
    group: false,
    unread: 0,
    updatedAt: Date.now() - 60 * MINUTE,
  },
  {
    id: "erasmus",
    name: "Erasmus Lublin",
    preview: "Friday works for me",
    group: true,
    unread: 0,
    updatedAt: Date.now() - 180 * MINUTE,
  },
  {
    id: "anna",
    name: "Anna Nowak",
    preview: "Sent the document",
    group: false,
    unread: 0,
    updatedAt: Date.now() - 1440 * MINUTE,
  },
];

export const useChatStore = create<ChatStore>((set) => ({
  conversations: initialConversations,
  messages: {},
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
          updatedAt: Date.now(),
        },
        ...state.conversations,
      ],
    }));
    return id;
  },
  // messages are kept oldest first, the order the thread shows them
  sendMessage: (id, text) =>
    set((state) => ({
      conversations: state.conversations.map((item) =>
        item.id === id ? { ...item, updatedAt: Date.now() } : item,
      ),
      messages: {
        ...state.messages,
        [id]: [
          ...(state.messages[id] ?? []),
          { id: idempotencyKey(), text, createdAt: Date.now(), mine: true },
        ],
      },
    })),
  reset: () => {
    nextGroupId = 1;
    set({ conversations: initialConversations, messages: {} });
  },
}));
