import type { components, operations } from "./schema";

export type FeedPost = {
  type: "EVENT" | "QUESTION";
  title: string;
  detail: string;
  body: string;
};

export type FeedView =
  | { screen: "list" }
  | { screen: "compose" }
  | { screen: "post"; title: string };

export type ApiFeedPost = components["schemas"]["Post"];
export type CreatePostInput = components["schemas"]["CreatePostInputBody"];
export type NewPostFormValues = {
  type: "question" | "announcement";
  title: string;
  content: string;
  audience: "all" | "university";
};
export type UpdatePostInput = components["schemas"]["UpdatePostInputBody"];
export type FeedFilters = Omit<
  NonNullable<operations["listFeedPosts"]["parameters"]["query"]>,
  "cursor"
>;
export type EditPostFormValues = Pick<NewPostFormValues, "title" | "content">;
export type CommentFormValues = { content: string };
