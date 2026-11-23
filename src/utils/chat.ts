import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { TFunction } from "i18next";
import type {
  ApiChatMessage,
  ApiChatStudent,
  ApiConversation,
  PickedImage,
} from "@/@types";
// the files, not the @/api barrel, which imports @/utils back
import { getChatMessageChanges } from "@/api/chat";
import { $api } from "@/api/client";
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

// how many photos each row holds, by count, as Telegram lays out an album; the API gives no
// image sizes, so the rows are fixed rather than fitted to each photo's shape
export const CHAT_ALBUM_ROWS: Record<number, number[]> = {
  1: [1],
  2: [2],
  3: [1, 2],
  4: [2, 2],
  5: [2, 3],
};

// the API's limit of images per message
export const MAX_CHAT_PHOTOS = 5;

// a student as chat shows them: their name, or "Deleted account" once they deleted it
export const chatStudentName = (
  student: ApiChatStudent | null | undefined,
  t: TFunction,
) =>
  student?.deleted
    ? t("chat.deletedAccount")
    : authorName(student ?? undefined) || t("apiState.student");

// a direct conversation has no name of its own; it shows the other student's
export const conversationTitle = (
  conversation: Pick<ApiConversation, "name" | "peer">,
  t: TFunction,
) => conversation.name ?? chatStudentName(conversation.peer, t);

// a message's time of day, as the bubble shows it
export const chatMessageTime = (createdAt: string, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(Date.parse(createdAt));

// a message as one line of text: its body, or what stands in for it. A system message names who did
// what from its payload (backend chat/system_message.go); `names` resolves the ids it carries, e.g.
// from the group's members, and an id it lacks reads as "someone"
export const chatMessageText = (
  message: ApiChatMessage,
  t: TFunction,
  names?: ReadonlyMap<string, string>,
) => {
  if (message.deletedAt) return t("chat.deletedMessage");
  if (message.kind !== "system") {
    return message.body || (message.attachments?.length ? t("chat.photo") : "");
  }
  const { event, params } = message.payload as {
    event?: unknown;
    params?: Record<string, unknown>;
  };
  const name = chatStudentName(message.sender, t);
  const nameOf = (id: unknown) =>
    (typeof id === "string" && names?.get(id)) || t("chat.someone");
  const title = typeof params?.name === "string" ? params.name : "";
  switch (event) {
    case "group_created":
      return t("chat.systemGroupCreated", { name, title });
    case "renamed":
      return t("chat.systemRenamed", { name, title });
    case "member_added": {
      const ids = Array.isArray(params?.userIds) ? params.userIds : [];
      return t("chat.systemMemberAdded", {
        name,
        names: ids.map(nameOf).join(", "),
      });
    }
    case "member_removed":
      return t("chat.systemMemberRemoved", {
        name,
        target: nameOf(params?.userId),
      });
    case "member_left":
      return t("chat.systemMemberLeft", { name });
    case "owner_changed":
      return t("chat.systemOwnerChanged", { target: nameOf(params?.userId) });
    default:
      return t("chat.systemOther");
  }
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
  // the other student's read position in a direct chat; the API has no field for it, so it lives
  // only in this cache, filled by read.updated events while the app runs
  peerRead: (id: string) => ["chat-peer-read", id],
};

type MessagePages = InfiniteData<{
  items: ApiChatMessage[] | null;
  nextCursor: string | null;
}>;

// a message shown before the API stored it (optimistic send): its id is made from the
// Idempotency-Key, which the stored message carries back as clientId
const PENDING_PREFIX = "pending:";
export const isPendingChatMessage = (message: ApiChatMessage) =>
  message.id.startsWith(PENDING_PREFIX);

// pending messages sort below every stored one: seq far past any real one, later sends further
export const pendingChatMessage = ({
  conversationId,
  key,
  text,
  photos,
  sender,
}: {
  conversationId: string;
  key: string;
  text: string;
  photos: PickedImage[];
  sender: ApiChatMessage["sender"];
}): ApiChatMessage => ({
  id: `${PENDING_PREFIX}${key}`,
  clientId: key,
  conversationId,
  seq: 1e15 + Date.now(),
  changeSeq: 0,
  kind: "text",
  body: text || null,
  // the picked photos show from the device until the stored message brings their links
  attachments: photos.map(({ uri }) => ({
    mediaId: uri,
    url: uri,
    expiresAt: new Date(8.64e15).toISOString(),
  })),
  createdAt: new Date().toISOString(),
  deletedAt: null,
  payload: {},
  sender,
});

// writes fetched messages into a loaded thread (newest first): a known one is replaced (a pending one
// by its clientId), a newer one joins the first page, and an older one the loaded pages lack stays out
export const mergeChatMessages = (
  queryClient: QueryClient,
  id: string,
  fetched: ApiChatMessage[],
) =>
  queryClient.setQueriesData<MessagePages>(
    { queryKey: chatKeys.messages(id) },
    (data) => {
      if (!data || fetched.length === 0) return data;
      const byId = new Map(fetched.map((message) => [message.id, message]));
      const byClientId = new Map(
        fetched.flatMap((message) =>
          message.clientId ? [[message.clientId, message] as const] : [],
        ),
      );
      const loaded = data.pages.flatMap((page) => page.items ?? []);
      const loadedIds = new Set(loaded.map(({ id }) => id));
      const pendingKeys = new Set(
        loaded.filter(isPendingChatMessage).map(({ clientId }) => clientId),
      );
      // pending messages sit above everything, so the newest stored one sets the bar
      const newestSeq =
        loaded.find((message) => !isPendingChatMessage(message))?.seq ?? 0;
      const added = fetched.filter(
        (message) =>
          !loadedIds.has(message.id) &&
          !pendingKeys.has(message.clientId) &&
          (isPendingChatMessage(message) || message.seq > newestSeq),
      );
      const replace = (message: ApiChatMessage) =>
        byId.get(message.id) ??
        (isPendingChatMessage(message) && message.clientId
          ? byClientId.get(message.clientId)
          : undefined) ??
        message;
      return {
        ...data,
        pages: data.pages.map((page, index) => {
          const items = (page.items ?? []).map(replace);
          return {
            ...page,
            items:
              index === 0
                ? [...added, ...items].sort((a, b) => b.seq - a.seq)
                : items,
          };
        }),
      };
    },
  );

// a conversation the loaded chat list already holds, e.g. to open it without waiting for the API
export const findCachedConversation = (
  queryClient: QueryClient,
  isMatch: (conversation: ApiConversation) => boolean,
) =>
  queryClient
    .getQueriesData<InfiniteData<{ items: ApiConversation[] | null }>>({
      queryKey: chatKeys.conversations,
    })
    .flatMap(
      ([, data]) => data?.pages.flatMap((page) => page.items ?? []) ?? [],
    )
    .find(isMatch);

// a pending message that failed to send leaves the thread
export const removeChatMessage = (
  queryClient: QueryClient,
  id: string,
  messageId: string,
) =>
  queryClient.setQueriesData<MessagePages>(
    { queryKey: chatKeys.messages(id) },
    (data) =>
      data && {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          items:
            page.items?.filter((message) => message.id !== messageId) ??
            page.items,
        })),
      },
  );

// a thread on screen asks only for what changed since its newest change (changedAfter) instead of
// reloading its pages; one off screen just goes stale, and a failed catch-up falls back to a reload
export const catchUpChatThread = async (
  queryClient: QueryClient,
  id: string,
) => {
  const queryKey = chatKeys.messages(id);
  const queries = queryClient.getQueryCache().findAll({ queryKey });
  if (!queries.some((query) => query.isActive())) {
    return queryClient.invalidateQueries({ queryKey, refetchType: "none" });
  }
  const changeSeqs = queryClient
    .getQueriesData<MessagePages>({ queryKey })
    .flatMap(([, data]) =>
      (data?.pages ?? []).flatMap((page) =>
        (page.items ?? []).map(({ changeSeq }) => changeSeq),
      ),
    );
  try {
    const changes = await getChatMessageChanges(id, Math.max(0, ...changeSeqs));
    mergeChatMessages(queryClient, id, changes);
  } catch {
    return queryClient.invalidateQueries({ queryKey });
  }
};

// a photo failed to load: when its link has expired, the message is fetched again with fresh links.
// fetchQuery runs one request for several photos of the same message failing at once
export const refreshChatPhotos = async (
  queryClient: QueryClient,
  message: ApiChatMessage,
) => {
  const isExpired = (message.attachments ?? []).some(
    ({ expiresAt }) => Date.parse(expiresAt) <= Date.now(),
  );
  if (!isExpired) return;
  const fresh = await queryClient.fetchQuery(
    $api.queryOptions("get", "/chat/messages/{id}", {
      params: { path: { id: message.id } },
    }),
  );
  mergeChatMessages(queryClient, message.conversationId, [fresh]);
};

// something in a conversation changed: its thread catches up on the changes, everything else cached
// about it, the list and the badge go stale, and only what is on screen refetches
export const refetchChatConversation = (queryClient: QueryClient, id: string) =>
  Promise.all([
    catchUpChatThread(queryClient, id),
    ...[
      chatKeys.conversation(id),
      chatKeys.members(id),
      chatKeys.conversations,
      chatKeys.unread,
    ].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  ]);

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
