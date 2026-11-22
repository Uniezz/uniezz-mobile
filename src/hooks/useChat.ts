import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  addChatMembers,
  createGroupConversation,
  deleteChatMessage,
  getChatConversation,
  getChatConversations,
  getChatMembers,
  getChatMessages,
  getChatUnread,
  leaveChatConversation,
  markChatRead,
  openDirectConversation,
  removeChatMember,
  renameChatConversation,
  sendChatMessage,
} from "@/api";
import type {
  ApiConversation,
  CreateChatGroupInput,
  SendChatMessageInput,
} from "@/@types";
import { idempotencyKey } from "@/utils";

// shortcut: no live stream yet (GET /chat/stream is SSE), so lists go stale quickly and refetch on focus;
// add the stream with catch-up through changedAfter once the backend is deployed

export function useChatConversations() {
  return useInfiniteQuery({
    staleTime: 15_000,
    gcTime: 10 * 60_000,
    queryKey: ["chat", "conversations"],
    queryFn: ({ pageParam }) => getChatConversations(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
}

export function useChatConversation(id: string) {
  return useQuery({
    staleTime: 15_000,
    gcTime: 10 * 60_000,
    queryKey: ["chat", "conversation", id],
    queryFn: () => getChatConversation(id),
  });
}

// newest first, as the API pages them; an inverted list shows them bottom up
export function useChatMessages(id: string) {
  return useInfiniteQuery({
    staleTime: 5_000,
    gcTime: 10 * 60_000,
    queryKey: ["chat", "messages", id],
    queryFn: ({ pageParam }) => getChatMessages(id, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
}

export function useChatMembers(id: string) {
  return useInfiniteQuery({
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    queryKey: ["chat", "members", id],
    queryFn: ({ pageParam }) => getChatMembers(id, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
}

export function useChatUnread() {
  return useQuery({
    staleTime: 15_000,
    gcTime: 10 * 60_000,
    queryKey: ["chat", "unread"],
    queryFn: getChatUnread,
  });
}

// a conversation's detail is cached from the answer; the list and unread totals refetch
const storeConversation = (
  queryClient: ReturnType<typeof useQueryClient>,
  conversation: ApiConversation,
) => {
  queryClient.setQueryData(
    ["chat", "conversation", conversation.id],
    conversation,
  );
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] }),
    queryClient.invalidateQueries({ queryKey: ["chat", "unread"] }),
  ]);
};

export function useOpenDirectConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "chat_direct_open" },
    mutationFn: openDirectConversation,
    onSuccess: (conversation) => storeConversation(queryClient, conversation),
  });
}

export function useCreateChatGroup() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, isError, variables } = useMutation({
    meta: { analyticsAction: "chat_group_create" },
    mutationFn: createGroupConversation,
    onSuccess: (conversation) => storeConversation(queryClient, conversation),
  });
  return {
    isPending,
    // a retry of the same failed group reuses its key, so it is not created twice
    createGroup: (body: CreateChatGroupInput) =>
      mutateAsync({
        body,
        key:
          isError &&
          variables &&
          JSON.stringify(variables.body) === JSON.stringify(body)
            ? variables.key
            : idempotencyKey(),
      }),
  };
}

export function useRenameChatConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "chat_group_rename" },
    mutationFn: renameChatConversation,
    onSuccess: (conversation) => storeConversation(queryClient, conversation),
  });
}

export function useAddChatMembers() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "chat_members_add" },
    mutationFn: addChatMembers,
    onSuccess: (_, { id }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["chat", "members", id] }),
        queryClient.invalidateQueries({
          queryKey: ["chat", "conversation", id],
        }),
      ]),
  });
}

export function useRemoveChatMember() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "chat_member_remove" },
    mutationFn: removeChatMember,
    onSuccess: (_, { id }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["chat", "members", id] }),
        queryClient.invalidateQueries({
          queryKey: ["chat", "conversation", id],
        }),
      ]),
  });
}

// the conversation leaves the list; its cached detail, messages and members go with it
export function useLeaveChatConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "chat_leave" },
    mutationFn: leaveChatConversation,
    onSuccess: (_, id) => {
      for (const key of ["conversation", "messages", "members"]) {
        queryClient.removeQueries({ queryKey: ["chat", key, id] });
      }
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] }),
        queryClient.invalidateQueries({ queryKey: ["chat", "unread"] }),
      ]);
    },
  });
}

export function useMarkChatRead() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "chat_read" },
    mutationFn: markChatRead,
    onSuccess: (read, { id }) => {
      queryClient.setQueryData<ApiConversation>(
        ["chat", "conversation", id],
        (current) => current && { ...current, ...read },
      );
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] }),
        queryClient.invalidateQueries({ queryKey: ["chat", "unread"] }),
      ]);
    },
  });
}

export function useSendChatMessage(id: string) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, isError, variables } = useMutation({
    meta: { analyticsAction: "chat_message_send" },
    mutationFn: sendChatMessage,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["chat", "messages", id] }),
        queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] }),
        queryClient.invalidateQueries({
          queryKey: ["chat", "conversation", id],
        }),
      ]),
  });
  return {
    isPending,
    // resending the same failed message reuses its key, so it is not sent twice
    sendMessage: (body: SendChatMessageInput) =>
      mutateAsync({
        id,
        body,
        key:
          isError &&
          variables &&
          variables.id === id &&
          JSON.stringify(variables.body) === JSON.stringify(body)
            ? variables.key
            : idempotencyKey(),
      }),
  };
}

export function useDeleteChatMessage(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "chat_message_delete" },
    mutationFn: deleteChatMessage,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["chat", "messages", conversationId],
        }),
        queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] }),
      ]),
  });
}
