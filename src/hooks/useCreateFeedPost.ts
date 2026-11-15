import { idempotencyKey } from "@/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFeedPost } from "@/api";
import type { CreatePostInput } from "@/@types";
import { invalidateRewards } from "./useRewards";

export function useCreateFeedPost() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, isError, variables } = useMutation({
    mutationKey: ["feed", "create-post"],
    meta: { analyticsAction: "post_create" },
    mutationFn: ({ body, key }: { body: CreatePostInput; key: string }) =>
      createFeedPost(body, key),
    onSuccess: (post) => {
      queryClient.setQueryData(["feed", "post", post.id], post);
      // a post counts toward today's quests
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["feed"] }),
        invalidateRewards(queryClient),
      ]);
    },
  });
  return {
    isPending,
    createPost: (body: CreatePostInput) =>
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
