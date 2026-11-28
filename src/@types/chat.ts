import type { PickedImage } from "./media";
import type { components } from "./schema";

export type MessageFormValues = { text: string; photos: PickedImage[] };
export type CreateGroupFormValues = { groupName: string; members: string[] };
export type RenameGroupFormValues = { groupName: string };

// the /chat API
export type ApiConversation = components["schemas"]["Conversation"];
export type ApiChatMessage = components["schemas"]["Message"];
export type ApiChatMember = components["schemas"]["Member"];
export type ApiChatStudent = components["schemas"]["Student"];
export type CreateChatGroupInput = components["schemas"]["GroupRequest"];
export type ChatSettings = components["schemas"]["Settings"];
export type WhoCanMessage = ChatSettings["whoCanMessage"];
export type SendChatMessageInput =
  components["schemas"]["SendChatMessageInputBody"];

// GET /chat/stream frames; the schema types the stream only as a string, so these follow the backend's chat/event.go
export type ChatStreamEvent =
  | { event: "ready" }
  | {
      event: "message.created" | "message.updated";
      data: {
        conversationId: string;
        changeSeq: number;
        message: ApiChatMessage;
      };
    }
  | {
      event: "conversation.updated";
      data: { conversationId: string; changeSeq: number };
    }
  | { event: "conversation.removed"; data: { conversationId: string } }
  | {
      event: "read.updated";
      data: {
        conversationId: string;
        userId: string;
        lastReadSeq: number;
        unreadCount?: number;
      };
    }
  | { event: "reconnect"; data: { afterMs: number } }
  | { event: "auth_expired" };
