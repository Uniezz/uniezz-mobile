import type { components } from "./schema";

export type Conversation = {
  id: string;
  name: string;
  preview: string;
  group: boolean;
  unread: number;
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
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
  createGroup: (name: string, members: string[]) => string;
  sendMessage: (id: string, text: string) => void;
  reset: () => void;
};

// the /chat API; the Conversation and ChatMessage types above still back the local chat store
export type ApiConversation = components["schemas"]["Conversation"];
export type ApiChatMessage = components["schemas"]["Message"];
export type ApiChatMember = components["schemas"]["Member"];
export type ApiChatStudent = components["schemas"]["Student"];
export type ChatConversationsPage =
  components["schemas"]["ListChatConversationsOutputBody"];
export type ChatMessagesPage =
  components["schemas"]["ListChatMessagesOutputBody"];
export type ChatMembersPage =
  components["schemas"]["ListChatMembersOutputBody"];
export type ChatUnread = components["schemas"]["GetChatUnreadOutputBody"];
export type ChatReadState = components["schemas"]["MarkChatReadOutputBody"];
export type AddChatMembersResult =
  components["schemas"]["AddChatMembersOutputBody"];
export type CreateChatGroupInput = components["schemas"]["GroupRequest"];
export type SendChatMessageInput =
  components["schemas"]["SendChatMessageInputBody"];
