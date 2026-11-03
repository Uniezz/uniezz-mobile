import type { PickedImage } from "./media";
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
  type: "question" | "announcement" | "event";
  title: string;
  content: string;
  audience: "all" | "university";
  eventDate: Date | null;
  tags: string[];
  photos: PickedImage[];
};
export type UpdatePostInput = components["schemas"]["UpdatePostInputBody"];
export type FeedFilters = Omit<
  NonNullable<operations["listFeedPosts"]["parameters"]["query"]>,
  "cursor"
>;
export type EditPostFormValues = Pick<
  NewPostFormValues,
  "title" | "content" | "tags"
>;
export type CommentFormValues = { content: string };
export type FeedComment = components["schemas"]["Comment"];
export type FeedFilterValues = {
  type: "all" | "announcement" | "question" | "event";
  university: string | null;
  date: "any" | "today" | "week" | "month";
};
