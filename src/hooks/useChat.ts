import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner-native";
import type { CreateChatGroupInput, PickedImage, Profile } from "@/@types";
import { $api, sendChatMessage, uploadImage } from "@/api";
import {
  apiErrorKey,
  chatKeys,
  findCachedConversation,
  forgetChatConversation,
  idempotencyKey,
  mergeChatMessages,
  pendingChatMessage,
  refetchChatConversation,
  removeChatMessage,
} from "@/utils";

// mutations and useChatStream mark what changed stale, and what is on screen refetches; the stale
// times only cover a stream that is down. A null cursor is left out of the request, where an
// undefined one would send 0

// newest activity first
export const useChatConversations = () =>
  $api.useInfiniteQuery(
    "get",
    "/chat/conversations",
    { params: { query: { limit: 20 } } },
    {
      staleTime: 15_000,
      gcTime: 10 * 60_000,
      initialPageParam: null,
      getNextPageParam: (page) => page.nextCursor,
    },
  );

// the header shows at once from the loaded chat list while the conversation itself loads
export function useChatConversation(id: string) {
  const queryClient = useQueryClient();
  return $api.useQuery(
    "get",
    "/chat/conversations/{id}",
    { params: { path: { id } } },
    {
      staleTime: 15_000,
      gcTime: 10 * 60_000,
      placeholderData: () =>
        findCachedConversation(queryClient, (row) => row.id === id),
    },
  );
}

// newest first, as the API pages them
export const useChatMessages = (id: string) =>
  $api.useInfiniteQuery(
    "get",
    "/chat/conversations/{id}/messages",
    { params: { path: { id }, query: { limit: 30 } } },
    {
      staleTime: 5_000,
      gcTime: 10 * 60_000,
      initialPageParam: null,
      getNextPageParam: (page) => page.nextCursor,
    },
  );

// unread totals over every conversation, for the chat tab's badge; off where chat is switched off
export const useChatUnread = (isEnabled: boolean) =>
  $api.useQuery("get", "/chat/unread", undefined, {
    enabled: isEnabled,
    staleTime: 15_000,
    gcTime: 10 * 60_000,
  });

// owner first; one page holds a whole group, as both cap at 50
export const useChatMembers = (id: string, isEnabled = true) =>
  $api.useQuery(
    "get",
    "/chat/conversations/{id}/members",
    { params: { path: { id }, query: { limit: 50 } } },
    { enabled: isEnabled, staleTime: 60_000, gcTime: 10 * 60_000 },
  );

// the other student's read position in a direct chat. The API has no field for it, so it is only what
// read.updated events reported while the app ran; the query never fetches
export const useChatPeerRead = (id: string) =>
  useQuery({
    queryKey: chatKeys.peerRead(id),
    queryFn: () => 0,
    enabled: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

// opens the direct conversation with a student, starting it when there is none, toasting a failure.
// One the loaded list already holds opens at once; a new one opens as soon as the API answers, and
// the list catches up after the screen has moved on
export function useOpenDirectChat() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = $api.useMutation(
    "post",
    "/chat/conversations/direct",
    { meta: { analyticsAction: "chat_direct_open" } },
  );
  const openChat = async (userId: string) => {
    const cached = findCachedConversation(
      queryClient,
      (row) => row.kind === "direct" && row.peer?.id === userId,
    );
    if (cached) {
      return router.push({ pathname: "/chat/[id]", params: { id: cached.id } });
    }
    try {
      const { id } = await mutateAsync({ body: { userId } });
      router.push({ pathname: "/chat/[id]", params: { id } });
      return refetchChatConversation(queryClient, id);
    } catch (error) {
      toast.error(t(apiErrorKey(error)));
    }
  };
  return { openChat, isPending };
}

export function useCreateChatGroup() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, isError, variables } = $api.useMutation(
    "post",
    "/chat/conversations/groups",
    {
      meta: { analyticsAction: "chat_group_create" },
      onSuccess: ({ id }) => refetchChatConversation(queryClient, id),
    },
  );
  const previousKey = variables?.params?.header?.["Idempotency-Key"];
  return {
    isPending,
    // a retry of the same failed group reuses its key, so it is not created twice
    createGroup: (body: CreateChatGroupInput) =>
      mutateAsync({
        body,
        params: {
          header: {
            "Idempotency-Key":
              isError &&
              previousKey &&
              JSON.stringify(variables?.body) === JSON.stringify(body)
                ? previousKey
                : idempotencyKey(),
          },
        },
      }),
  };
}

// the read position only moves forward
export function useMarkChatRead(id: string) {
  const queryClient = useQueryClient();
  return $api.useMutation("put", "/chat/conversations/{id}/read", {
    meta: { analyticsAction: "chat_read" },
    onSuccess: () => refetchChatConversation(queryClient, id),
  });
}

// only the owner may rename; the system message arrives through the stream
export function useRenameChatGroup() {
  const queryClient = useQueryClient();
  return $api.useMutation("patch", "/chat/conversations/{id}", {
    meta: { analyticsAction: "chat_group_rename" },
    onSuccess: ({ id }) => refetchChatConversation(queryClient, id),
  });
}

// any member may add their own connections; the system messages arrive through the stream
export function useAddChatMembers(id: string) {
  const queryClient = useQueryClient();
  return $api.useMutation("post", "/chat/conversations/{id}/members", {
    meta: { analyticsAction: "chat_members_add" },
    onSuccess: () => refetchChatConversation(queryClient, id),
  });
}

// only the owner may remove a member; the system message arrives through the stream
export function useRemoveChatMember(id: string) {
  const queryClient = useQueryClient();
  return $api.useMutation(
    "delete",
    "/chat/conversations/{id}/members/{userId}",
    {
      meta: { analyticsAction: "chat_member_remove" },
      onSuccess: () => refetchChatConversation(queryClient, id),
    },
  );
}

// the group leaves the list with its cached detail, messages and members
export function useLeaveChatGroup(id: string) {
  const queryClient = useQueryClient();
  return $api.useMutation("delete", "/chat/conversations/{id}/members/me", {
    meta: { analyticsAction: "chat_leave" },
    onSuccess: () => forgetChatConversation(queryClient, id),
  });
}

// a deleted message stays as an empty tombstone, so positions keep
export function useDeleteChatMessage(conversationId: string) {
  const queryClient = useQueryClient();
  return $api.useMutation("delete", "/chat/messages/{id}", {
    meta: { analyticsAction: "chat_message_delete" },
    onSuccess: () => refetchChatConversation(queryClient, conversationId),
  });
}

type SendChatVariables = { text: string; photos: PickedImage[]; key: string };

// optimistic: the message shows at once, dimmed, with the picked photos from the device; the stored
// one takes its place (matched by clientId), and a failed one leaves the thread
export function useSendChatMessage(id: string) {
  const queryClient = useQueryClient();
  const { mutate, isError, variables } = useMutation({
    meta: { analyticsAction: "chat_message_send" },
    // photos upload one at a time: each is decoded into a bitmap of tens of MB while it is compressed
    mutationFn: async ({ text, photos, key }: SendChatVariables) => {
      const attachmentIds: string[] = [];
      for (const photo of photos) {
        attachmentIds.push(await uploadImage(photo, "chat"));
      }
      return sendChatMessage(
        id,
        {
          body: text || undefined,
          attachmentIds: attachmentIds.length ? attachmentIds : undefined,
        },
        key,
      );
    },
    onMutate: async ({ text, photos, key }) => {
      await queryClient.cancelQueries({ queryKey: chatKeys.messages(id) });
      const me = queryClient.getQueryData<Profile>(["profile", "me"]);
      mergeChatMessages(queryClient, id, [
        pendingChatMessage({
          conversationId: id,
          key,
          text,
          photos,
          sender: {
            id: me?.id ?? null,
            firstName: me?.firstName ?? null,
            lastName: me?.lastName ?? null,
            avatarUrl: me?.avatarUrl ?? null,
            universityId: me?.universityId ?? null,
            deleted: false,
          },
        }),
      ]);
    },
    onError: (_, { key }) =>
      removeChatMessage(queryClient, id, `pending:${key}`),
    onSuccess: (message) => {
      mergeChatMessages(queryClient, id, [message]);
      return refetchChatConversation(queryClient, id);
    },
  });
  // a text-only resend of a failed message reuses its key, so it is not sent twice; with photos the
  // uploads are new, and the API refuses an old key with another body
  const keyFor = (text: string, photos: PickedImage[]) =>
    isError &&
    variables &&
    photos.length === 0 &&
    variables.photos.length === 0 &&
    variables.text === text
      ? variables.key
      : idempotencyKey();
  return {
    sendMessage: (
      { text, photos }: { text: string; photos: PickedImage[] },
      options?: { onError?: (error: Error) => void },
    ) => mutate({ text, photos, key: keyFor(text, photos) }, options),
  };
}
