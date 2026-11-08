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
  getFeedPostNavigation,
  getFeedPost,
  getFeedPosts,
  setFeedLike,
  updateFeedPost,
} from "@/api";
import type { FeedFilters, FeedNavigationFilters } from "@/@types/feed";
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
    mutationFn: setFeedLike,
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

export function useFeedPostNavigation(
  id: string,
  filters: FeedNavigationFilters = {},
) {
  return useQuery({
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    // Under "posts" so post writes that refresh the feed also refresh neighbours.
    queryKey: ["feed", "posts", "navigation", id, filters],
    queryFn: () => getFeedPostNavigation(id, filters),
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

export function useFeedPost(id: string) {
  return useQuery({
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    queryKey: ["feed", "post", id],
    queryFn: () => getFeedPost(id),
  });
}
