import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  deleteFeedPost,
  getFeedPost,
  getFeedPosts,
  setFeedLike,
  updateFeedPost,
} from "@/api";
import type { FeedFilters } from "@/@types/feed";
import { patchFeedItem } from "./patchFeedItem";

export function useUpdateFeedPost() {
  const queryClient = useQueryClient();
  return useMutation({
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
    mutationFn: deleteFeedPost,
    onSuccess: (_, id) => {
      queryClient.removeQueries({
        queryKey: ["feed", "post", id],
        exact: true,
      });
      return queryClient.invalidateQueries({ queryKey: ["feed", "posts"] });
    },
  });
}

export function useFeedLike() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setFeedLike,
    onSuccess: ({ liked, likesCount }, { id }) =>
      patchFeedItem(queryClient, id, { likedByMe: liked, likesCount }),
  });
}

export function useFeedPosts(filters: FeedFilters = {}) {
  return useInfiniteQuery({
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

export function useFeedPost(id: string) {
  return useQuery({
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    queryKey: ["feed", "post", id],
    queryFn: () => getFeedPost(id),
  });
}
