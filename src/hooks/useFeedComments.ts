import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createFeedComment,
  deleteFeedComment,
  getCommentReplies,
  getFeedComments,
  updateFeedComment,
} from "@/api";
import { patchFeedItem } from "./patchFeedItem";

export function useFeedComments(id: string) {
  return useInfiniteQuery({
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    queryKey: ["feed", "comments", id],
    queryFn: ({ pageParam }) => getFeedComments(id, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
}

export function useCommentReplies(id: string, enabled: boolean) {
  return useInfiniteQuery({
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    queryKey: ["feed", "replies", id],
    queryFn: ({ pageParam }) => getCommentReplies(id, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    enabled,
  });
}

export function useUpdateFeedComment() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "comment_update" },
    mutationFn: updateFeedComment,
    onSuccess: (comment) => patchFeedItem(queryClient, comment.id, comment),
  });
}

export function useDeleteFeedComment() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "comment_delete" },
    mutationFn: deleteFeedComment,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["feed", "comments"] }),
        queryClient.invalidateQueries({ queryKey: ["feed", "replies"] }),
        queryClient.invalidateQueries({ queryKey: ["feed", "post"] }),
      ]),
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  const { mutateAsync, variables, isError, isPending } = useMutation({
    mutationKey: ["feed", "create-comment"],
    meta: { analyticsAction: "comment_create" },
    mutationFn: createFeedComment,
    onSuccess: (_, { id, replyToCommentId }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["feed", "comments", id] }),
        queryClient.invalidateQueries({ queryKey: ["feed", "post", id] }),
        replyToCommentId &&
          queryClient.invalidateQueries({
            queryKey: ["feed", "replies", replyToCommentId],
          }),
      ]),
  });

  function createComment(
    input: Omit<Parameters<typeof createFeedComment>[0], "key">,
  ) {
    const key =
      isError &&
      variables?.id === input.id &&
      variables.content === input.content &&
      variables.replyToCommentId === input.replyToCommentId
        ? variables.key
        : crypto.randomUUID();
    return mutateAsync({ ...input, key });
  }

  return { createComment, isPending };
}
