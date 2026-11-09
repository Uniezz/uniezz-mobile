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
