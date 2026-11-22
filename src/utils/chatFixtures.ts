// shortcut: an in-memory stand-in for /chat, which exists only on the backend's feat/chat-core branch;
// delete this file once USE_CHAT_FIXTURES in src/api/chat.ts is false.
// Not in the @/utils barrel: its names would clash there, and only src/api/chat.ts reads it
import type {
  AddChatMembersResult,
  ApiChatMember,
  ApiChatMessage,
  ApiChatStudent,
  ApiConversation,
  ChatConversationsPage,
  ChatMembersPage,
  ChatMessagesPage,
  ChatReadState,
  ChatUnread,
  CreateChatGroupInput,
  SendChatMessageInput,
} from "@/@types";
import { idempotencyKey } from "./id";
// the client file, not the @/api barrel, which imports @/utils back
import { ApiRequestError } from "@/api/client";

const MINUTE = 60_000;
const ago = (minutes: number) =>
  new Date(Date.now() - minutes * MINUTE).toISOString();

// fixture messages the signed-in student sends carry this id, not their profile id
export const FIXTURE_MY_ID = "00000000-0000-4000-8000-000000000000";

const student = (
  id: string,
  firstName: string,
  lastName: string,
): ApiChatStudent => ({
  id,
  firstName,
  lastName,
  avatarUrl: null,
  deleted: false,
  universityId: "umcs",
});

const me = student(FIXTURE_MY_ID, "Ty", "");
const STUDENTS = [
  student("00000000-0000-4000-8000-000000000001", "Kateryna", "Melnyk"),
  student("00000000-0000-4000-8000-000000000002", "Taras", "Hnatiuk"),
  student("00000000-0000-4000-8000-000000000003", "Anna", "Nowak"),
  student("00000000-0000-4000-8000-000000000004", "Olek", "Wiśniewski"),
] as const;
const [kateryna, taras, anna, olek] = STUDENTS;
const studentById = (id: string) =>
  STUDENTS.find((item) => item.id === id) ?? student(id, "Student", "");

const textMessage = (
  conversationId: string,
  seq: number,
  sender: ApiChatStudent,
  body: string,
  minutesAgo: number,
): ApiChatMessage => ({
  id: `${conversationId}-${seq}`,
  conversationId,
  seq,
  changeSeq: seq,
  kind: "text",
  body,
  attachments: null,
  clientId: null,
  createdAt: ago(minutesAgo),
  deletedAt: null,
  payload: {},
  sender,
});

const member = (
  item: ApiChatStudent,
  role: ApiChatMember["role"],
): ApiChatMember => ({ student: item, role, joinedAt: ago(10_000) });

// oldest first per conversation, the order they were sent
const messages: Record<string, ApiChatMessage[]> = {
  kateryna: [
    textMessage(
      "kateryna",
      1,
      kateryna,
      "Hej! Are you going to the lecture?",
      30,
    ),
    textMessage("kateryna", 2, me, "Yes, see you there", 25),
    textMessage("kateryna", 3, kateryna, "See you after class!", 2),
  ],
  mechatronika: [
    textMessage("mechatronika", 1, olek, "Who has the notes?", 18),
  ],
  taras: [textMessage("taras", 1, taras, "Thanks for the help", 60)],
  erasmus: [textMessage("erasmus", 1, anna, "Friday works for me", 180)],
};

const members: Record<string, ApiChatMember[]> = {
  mechatronika: [
    member(me, "owner"),
    member(kateryna, "member"),
    member(taras, "member"),
    member(olek, "member"),
  ],
  erasmus: [
    member(anna, "owner"),
    member(me, "member"),
    member(olek, "member"),
  ],
};

const conversation = (
  id: string,
  fields: Pick<ApiConversation, "kind" | "unreadCount"> &
    Partial<ApiConversation>,
): ApiConversation => {
  const lastSeq = messages[id]?.length ?? 0;
  return {
    id,
    createdAt: ago(10_000),
    name: null,
    memberCount: null,
    myRole: null,
    lastMessage: messages[id]?.at(-1),
    lastSeq,
    changeSeq: lastSeq,
    lastReadSeq: lastSeq - fields.unreadCount,
    ...fields,
  };
};

let conversations: ApiConversation[] = [
  conversation("kateryna", { kind: "direct", peer: kateryna, unreadCount: 2 }),
  conversation("mechatronika", {
    kind: "group",
    name: "Mechatronika, sem 5",
    memberCount: 4,
    myRole: "owner",
    unreadCount: 1,
  }),
  conversation("taras", { kind: "direct", peer: taras, unreadCount: 0 }),
  conversation("erasmus", {
    kind: "group",
    name: "Erasmus Lublin",
    memberCount: 3,
    myRole: "member",
    unreadCount: 0,
  }),
];

const notFound = (operation: string) =>
  new ApiRequestError(
    operation,
    "HTTP 404, fixture not found",
    undefined,
    undefined,
    404,
  );

const find = (operation: string, id: string) => {
  const found = conversations.find((item) => item.id === id);
  if (!found) throw notFound(operation);
  return found;
};

const update = (id: string, patch: Partial<ApiConversation>) => {
  conversations = conversations.map((item) =>
    item.id === id ? { ...item, ...patch } : item,
  );
  return find("PATCH fixture conversation", id);
};

const lastActivity = (item: ApiConversation) =>
  item.lastMessage?.createdAt ?? item.createdAt;

export const listConversations = (): ChatConversationsPage => ({
  items: [...conversations].sort((a, b) =>
    lastActivity(b).localeCompare(lastActivity(a)),
  ),
  nextCursor: null,
});

export const getConversation = (id: string) =>
  find("GET /chat/conversations/{id}", id);

export const openDirectConversation = (userId: string) => {
  const existing = conversations.find(
    (item) => item.kind === "direct" && item.peer?.id === userId,
  );
  if (existing) return existing;
  const created = conversation(idempotencyKey(), {
    kind: "direct",
    peer: studentById(userId),
    unreadCount: 0,
  });
  conversations = [created, ...conversations];
  return created;
};

export const createGroupConversation = ({
  name,
  memberIds,
}: CreateChatGroupInput) => {
  const id = idempotencyKey();
  members[id] = [
    member(me, "owner"),
    ...(memberIds ?? []).map((userId) => member(studentById(userId), "member")),
  ];
  const created = conversation(id, {
    kind: "group",
    name,
    memberCount: members[id].length,
    myRole: "owner",
    unreadCount: 0,
  });
  conversations = [created, ...conversations];
  return created;
};

export const renameConversation = (id: string, name: string) =>
  update(id, { name });

export const listMembers = (id: string): ChatMembersPage => ({
  items: members[id] ?? [],
  nextCursor: null,
});

export const addMembers = (
  id: string,
  userIds: string[],
): AddChatMembersResult => {
  const current = members[id] ?? [];
  const added = userIds
    .filter((userId) => !current.some((item) => item.student.id === userId))
    .map((userId) => member(studentById(userId), "member"));
  members[id] = [...current, ...added];
  update(id, { memberCount: members[id].length });
  return { items: added };
};

export const leaveConversation = (id: string) => {
  conversations = conversations.filter((item) => item.id !== id);
};

export const removeMember = (id: string, userId: string) => {
  members[id] = (members[id] ?? []).filter(
    (item) => item.student.id !== userId,
  );
  update(id, { memberCount: members[id].length });
};

export const markRead = (id: string, seq: number): ChatReadState => {
  const current = find("PUT /chat/conversations/{id}/read", id);
  const lastReadSeq = Math.min(
    Math.max(seq, current.lastReadSeq),
    current.lastSeq,
  );
  const unreadCount = current.lastSeq - lastReadSeq;
  update(id, { lastReadSeq, unreadCount });
  return { lastReadSeq, unreadCount };
};

export const getUnread = (): ChatUnread => ({
  totalUnread: conversations.reduce((sum, item) => sum + item.unreadCount, 0),
  unreadConversations: conversations.filter((item) => item.unreadCount > 0)
    .length,
});

// history mode: newest first by seq
export const listMessages = (id: string): ChatMessagesPage => {
  find("GET /chat/conversations/{id}/messages", id);
  return { items: [...(messages[id] ?? [])].reverse(), nextCursor: null };
};

export const sendMessage = (
  id: string,
  { body = "" }: SendChatMessageInput,
  clientId: string,
) => {
  const current = find("POST /chat/conversations/{id}/messages", id);
  const sent = {
    ...textMessage(id, current.lastSeq + 1, me, body, 0),
    clientId,
  };
  messages[id] = [...(messages[id] ?? []), sent];
  update(id, {
    lastMessage: sent,
    lastSeq: sent.seq,
    changeSeq: sent.seq,
    lastReadSeq: sent.seq,
    unreadCount: 0,
  });
  return sent;
};

// the message stays as an empty tombstone, as the API keeps positions
export const deleteMessage = (messageId: string) => {
  for (const [id, list] of Object.entries(messages)) {
    messages[id] = list.map((item) =>
      item.id === messageId
        ? { ...item, body: null, attachments: null, deletedAt: ago(0) }
        : item,
    );
  }
};
