import { create } from "zustand";
import type { ChatStore } from "@/@types/chat";

let nextGroupId = 1;

const initialConversations = [
  {
    id: "kateryna",
    name: "Kateryna Melnyk",
    preview: "See you after class!",
    group: false,
    unread: 2,
  },
  {
    id: "mechatronika",
    name: "Mechatronika, sem 5",
    preview: "Who has the notes?",
    group: true,
    unread: 1,
  },
  {
    id: "taras",
    name: "Taras Hnatiuk",
    preview: "Thanks for the help",
    group: false,
    unread: 0,
  },
  {
    id: "erasmus",
    name: "Erasmus Lublin",
    preview: "Friday works for me",
    group: true,
    unread: 0,
  },
  {
    id: "anna",
    name: "Anna Nowak",
    preview: "Sent the document",
    group: false,
    unread: 0,
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
        },
        ...state.conversations,
      ],
    }));
    return id;
  },
  sendMessages: (id, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [id]: [...messages, ...(state.messages[id] ?? [])],
      },
    })),
  reset: () => {
    nextGroupId = 1;
    set({ conversations: initialConversations, messages: {} });
  },
}));
