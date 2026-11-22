import type { QueryClient } from "@tanstack/react-query";
import type { TFunction } from "i18next";
import type { ApiChatMessage, ApiConversation } from "@/@types";
import { authorName } from "./feed";

const DAY = 24 * 60 * 60 * 1000;

// conversation list time: clock time today, weekday this week, date before that
export const chatTime = (
  updatedAt: number,
  locale: string,
  now = Date.now(),
) => {
  const date = new Date(updatedAt);
  const today = new Date(now).toDateString() === date.toDateString();
  return new Intl.DateTimeFormat(
    locale,
    today
      ? { hour: "2-digit", minute: "2-digit" }
      : now - updatedAt < 6 * DAY
        ? { weekday: "short" }
        : { month: "short", day: "numeric" },
  ).format(date);
};

export const isSameDay = (a: number, b: number) =>
  new Date(a).toDateString() === new Date(b).toDateString();

// thread day separator: `todayLabel` for today, otherwise the date
export const chatDay = (
  createdAt: number,
  locale: string,
  todayLabel: string,
  now = Date.now(),
) =>
  isSameDay(createdAt, now)
    ? todayLabel
    : new Intl.DateTimeFormat(locale, {
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(createdAt);

// the tab badge's text: the count, capped like UIBadge
export const unreadBadge = (count: number) =>
  count > 99 ? "99+" : String(count);

// the API's limit of images per message
export const MAX_CHAT_PHOTOS = 5;

// a direct conversation has no name of its own; it shows the other student's
export const conversationTitle = (
  conversation: Pick<ApiConversation, "name" | "peer">,
) => conversation.name ?? authorName(conversation.peer ?? undefined);

// keys are the backend's system events (chat/system_message.go); an unknown one falls back to chat.systemOther
export const CHAT_SYSTEM_LABELS: Record<string, string> = {
  group_created: "chat.systemGroupCreated",
  renamed: "chat.systemRenamed",
  member_added: "chat.systemMemberAdded",
  member_removed: "chat.systemMemberRemoved",
  member_left: "chat.systemMemberLeft",
  owner_changed: "chat.systemOwnerChanged",
};

// a message as one line of text: its body, or what stands in for it
export const chatMessageText = (message: ApiChatMessage, t: TFunction) => {
  if (message.deletedAt) return t("chat.deletedMessage");
  if (message.kind === "system") {
    const event =
      typeof message.payload.event === "string" ? message.payload.event : "";
    return t(CHAT_SYSTEM_LABELS[event] ?? "chat.systemOther", {
      name: authorName(message.sender),
    });
  }
  return message.body || (message.attachments?.length ? t("chat.photo") : "");
};

// chat goes through openapi-react-query, whose query keys are [method, path, init];
// a key with a partial init (or none) matches every query under it
export const chatKeys = {
  conversations: ["get", "/chat/conversations"],
  conversation: (id: string) => [
    "get",
    "/chat/conversations/{id}",
    { params: { path: { id } } },
  ],
  messages: (id: string) => [
    "get",
    "/chat/conversations/{id}/messages",
    { params: { path: { id } } },
  ],
  members: (id: string) => [
    "get",
    "/chat/conversations/{id}/members",
    { params: { path: { id } } },
  ],
  unread: ["get", "/chat/unread"],
};

// something in a conversation changed: everything cached about it, the list and the badge go stale,
// and only what is on screen refetches
export const refetchChatConversation = (queryClient: QueryClient, id: string) =>
  Promise.all(
    [
      chatKeys.messages(id),
      chatKeys.conversation(id),
      chatKeys.members(id),
      chatKeys.conversations,
      chatKeys.unread,
    ].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  );

// a left or removed conversation: its cache goes, the list and the badge refetch
export const forgetChatConversation = (
  queryClient: QueryClient,
  id: string,
) => {
  for (const queryKey of [
    chatKeys.conversation(id),
    chatKeys.messages(id),
    chatKeys.members(id),
  ]) {
    queryClient.removeQueries({ queryKey });
  }
  return Promise.all(
    [chatKeys.conversations, chatKeys.unread].map((queryKey) =>
      queryClient.invalidateQueries({ queryKey }),
    ),
  );
};
