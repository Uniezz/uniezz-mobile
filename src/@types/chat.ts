import type { components } from "./schema";

export type ApiConversation = components["schemas"]["Conversation"];
export type ApiChatMessage = components["schemas"]["Message"];
export type SendChatMessageInput =
  components["schemas"]["SendChatMessageInputBody"];

export type Conversation = {
  id: string;
  name: string;
  preview: string;
  group: boolean;
  unread: number;
  changeSeq: number;
  lastSeq: number;
  /** last activity, epoch ms */
  updatedAt: number;
};

export type ChatMessage = {
  id: string;
  text: string;
  /** epoch ms */
  createdAt: number;
  /** sent by the signed-in student */
  mine: boolean;
};
export type MessageFormValues = { text: string };
export type CreateGroupFormValues = { groupName: string; members: string[] };

export type ChatStore = {
  myId: string | null;
  activeConversationId: string | null;
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
  setMyId: (id: string | null) => void;
  setActiveConversation: (id: string | null) => void;
  loadConversations: () => Promise<void>;
  loadMessages: (id: string) => Promise<void>;
  catchUp: (conversationId: string, changedAfter: number) => Promise<void>;
  markRead: (conversationId: string, seq: number) => Promise<void>;
  upsertConversation: (conversation: ApiConversation) => void;
  removeConversation: (id: string) => void;
  receiveMessage: (message: ApiChatMessage) => void;
  createGroup: (name: string, members: string[]) => string;
  sendMessage: (id: string, text: string) => Promise<void>;
  reset: () => void;
};
