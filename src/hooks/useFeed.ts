import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  deleteFeedPost,
  getFeaturedFeedPosts,
  getFeedPost,
  getFeedPosts,
  getLikedFeedPosts,
  getSavedFeedPosts,
  setFeedLike,
  setFeedSave,
  updateFeedPost,
} from "@/api";
import type { FeedFilters } from "@/@types/feed";
import { patchFeedItem } from "./patchFeedItem";

export function useUpdateFeedPost() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "post_update" },
    mutationFn: updateFeedPost,
    onSuccess: (post) => {
      queryClient.setQueryData(["feed", "post", post.id], post);
      return queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export function useDeleteFeedPost() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "post_delete" },
    mutationFn: deleteFeedPost,
    onSuccess: (_, id) => {
      queryClient.removeQueries({
        queryKey: ["feed", "post", id],
        exact: true,
      });
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["feed", "posts"] }),
        queryClient.invalidateQueries({ queryKey: ["feed", "featured"] }),
      ]);
    },
  });
}

export function useFeedLike() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "post_like_set" },
    // likesCount is the count before the tap, for the optimistic patch and its rollback
    mutationFn: ({
      likesCount: _,
      ...like
    }: Parameters<typeof setFeedLike>[0] & { likesCount: number }) =>
      setFeedLike(like),
    // the heart and count change on tap; the server's answer then settles them
    onMutate: ({ id, liked, likesCount }) =>
      patchFeedItem(queryClient, id, {
        likedByMe: liked,
        likesCount: likesCount + (liked ? 1 : -1),
      }),
    onError: (_, { id, liked, likesCount }) =>
      patchFeedItem(queryClient, id, { likedByMe: !liked, likesCount }),
    onSuccess: ({ liked, likesCount }, { id, kind }) => {
      patchFeedItem(queryClient, id, { likedByMe: liked, likesCount });
      // Featured ranking follows this week's post likes.
      if (kind === "post") {
        return queryClient.invalidateQueries({
          queryKey: ["feed", "featured"],
        });
      }
    },
  });
}

export function useFeedSave() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "post_save_set" },
    // savedByMe is the state before the tap, for the optimistic patch and its rollback
    mutationFn: setFeedSave,
    onMutate: ({ id, saved }) =>
      patchFeedItem(queryClient, id, { savedByMe: saved }),
    onError: (_, { id, saved }) =>
      patchFeedItem(queryClient, id, { savedByMe: !saved }),
    onSuccess: ({ saved }, { id }) => {
      patchFeedItem(queryClient, id, { savedByMe: saved });
      // The saved list gains or loses this post.
      return queryClient.invalidateQueries({ queryKey: ["feed", "saved"] });
    },
  });
}

export function useFeedPosts(
  filters: FeedFilters = {},
  { enabled = true } = {},
) {
  return useInfiniteQuery({
    enabled,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    queryKey: ["feed", "posts", filters],
    queryFn: ({ pageParam }) => getFeedPosts(filters, pageParam),
    // Keeps the current posts on screen while a filter change loads, instead of a skeleton flash.
    placeholderData: keepPreviousData,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
}

export function useFeaturedFeedPosts() {
  return useQuery({
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    queryKey: ["feed", "featured"],
    queryFn: getFeaturedFeedPosts,
  });
}

// `enabled: false` skips it, e.g. to prefetch a neighbour only once its id is known
export function useFeedPost(id: string, enabled = true) {
  return useQuery({
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    queryKey: ["feed", "post", id],
    queryFn: () => getFeedPost(id),
    enabled,
  });
}

export function useLikedFeedPosts() {
  return useInfiniteQuery({
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    queryKey: ["feed", "liked"],
    queryFn: ({ pageParam }) => getLikedFeedPosts(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
}

export function useSavedFeedPosts() {
  return useInfiniteQuery({
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    queryKey: ["feed", "saved"],
    queryFn: ({ pageParam }) => getSavedFeedPosts(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
}
