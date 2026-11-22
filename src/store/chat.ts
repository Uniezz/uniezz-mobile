import { create } from "zustand";
import type { ChatStore } from "@/@types";
import { idempotencyKey } from "@/utils/id";

let nextGroupId = 1;
const MINUTE = 60 * 1000;

const initialConversations = [
  {
    id: "kateryna",
    name: "Kateryna Melnyk",
    preview: "See you after class!",
    group: false,
    isMember: true,
    unread: 2,
    updatedAt: Date.now() - 2 * MINUTE,
  },
  {
    id: "mechatronika",
    name: "Mechatronika, sem 5",
    preview: "Who has the notes?",
    group: true,
    isMember: true,
    unread: 1,
    updatedAt: Date.now() - 18 * MINUTE,
  },
  {
    id: "taras",
    name: "Taras Hnatiuk",
    preview: "Thanks for the help",
    group: false,
    isMember: true,
    unread: 0,
    updatedAt: Date.now() - 60 * MINUTE,
  },
  {
    id: "erasmus",
    name: "Erasmus Lublin",
    preview: "Friday works for me",
    group: true,
    isMember: false,
    unread: 0,
    updatedAt: Date.now() - 180 * MINUTE,
  },
  {
    id: "anna",
    name: "Anna Nowak",
    preview: "Sent the document",
    group: false,
    isMember: true,
    unread: 0,
    updatedAt: Date.now() - 1440 * MINUTE,
  },
];

const initialMessages = {
  mechatronika: [
    {
      id: "mechatronika-1",
      text: "Who has the notes?",
      createdAt: Date.now() - 18 * MINUTE,
      mine: false,
    },
  ],
};

export const useChatStore = create<ChatStore>((set) => ({
  conversations: initialConversations,
  messages: initialMessages,
  createGroup: (name, members) => {
    const id = `group-${nextGroupId++}`;
    set((state) => ({
      conversations: [
        {
          id,
          name,
          preview: `${members.length} members`,
          group: true,
          isMember: true,
          unread: 0,
          updatedAt: Date.now(),
        },
        ...state.conversations,
      ],
    }));
    return id;
  },
  // messages are kept oldest first, the order the thread shows them
  sendMessage: (id, text) => {
    let sent = false;
    set((state) => {
      const conversation = state.conversations.find((item) => item.id === id);
      if (!conversation?.isMember) return state;
      sent = true;
      return {
        conversations: state.conversations.map((item) =>
          item.id === id
            ? { ...item, preview: text, updatedAt: Date.now() }
            : item,
        ),
        messages: {
          ...state.messages,
          [id]: [
            ...(state.messages[id] ?? []),
            { id: idempotencyKey(), text, createdAt: Date.now(), mine: true },
          ],
        },
      };
    });
    return sent;
  },
  reset: () => {
    nextGroupId = 1;
    set({ conversations: initialConversations, messages: initialMessages });
  },
}));
