import type { IMessage } from "react-native-gifted-chat";

export type Conversation = {
  id: string;
  name: string;
  preview: string;
  group: boolean;
  unread: number;
};

export type ChatMessage = IMessage;
export type CreateGroupFormValues = { groupName: string; members: string[] };

export type ChatStore = {
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
  createGroup: (name: string, members: string[]) => string;
  sendMessages: (id: string, messages: ChatMessage[]) => void;
  reset: () => void;
};
