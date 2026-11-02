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
