import type {
  CreatePostInput,
  FeedFilters,
  UpdatePostInput,
} from "@/@types/feed";
import { api } from "./client";

export async function updateFeedComment({
  id,
  content,
}: {
  id: string;
  content: string;
}) {
  const { data } = await api.PATCH("/feed/comments/{id}", {
    params: { path: { id } },
    body: { content },
  });

  return data!;
}

export async function updateFeedPost({
  id,
  body,
}: {
  id: string;
  body: UpdatePostInput;
}) {
  const { data } = await api.PATCH("/feed/posts/{id}", {
    params: { path: { id } },
    body,
  });

  return data!;
}

export async function deleteFeedPost(id: string) {
  await api.DELETE("/feed/posts/{id}", {
    params: { path: { id } },
  });
}

export async function deleteFeedComment(id: string) {
  await api.DELETE("/feed/comments/{id}", {
    params: { path: { id } },
  });
}

export async function setFeedLike({
  id,
  kind,
  liked,
}: {
  id: string;
  kind: "post" | "comment";
  liked: boolean;
}) {
  const params = { path: { id } };
  let result;
  if (kind === "post") {
    result = liked
      ? await api.PUT("/feed/posts/{id}/like", { params })
      : await api.DELETE("/feed/posts/{id}/like", { params });
  } else {
    result = liked
      ? await api.PUT("/feed/comments/{id}/like", { params })
      : await api.DELETE("/feed/comments/{id}/like", { params });
  }

  return result.data!;
}

export async function getFeedPosts(filters: FeedFilters = {}, cursor?: string) {
  const { data } = await api.GET("/feed/posts", {
    params: { query: { limit: 20, ...filters, cursor } },
  });

  return data!;
}

export async function getFeaturedFeedPosts() {
  const { data } = await api.GET("/feed/posts/featured");
  return data!;
}

export async function getLikedFeedPosts(cursor?: string) {
  const { data } = await api.GET("/feed/posts/liked", {
    params: { query: { cursor, limit: 20 } },
  });

  return data!;
}

export async function getSavedFeedPosts(cursor?: string) {
  const { data } = await api.GET("/feed/posts/saved", {
    params: { query: { cursor, limit: 20 } },
  });

  return data!;
}

export async function setFeedSave({
  id,
  saved,
}: {
  id: string;
  saved: boolean;
}) {
  const params = { path: { id } };
  const result = saved
    ? await api.PUT("/feed/posts/{id}/save", { params })
    : await api.DELETE("/feed/posts/{id}/save", { params });

  return result.data!;
}

export async function getFeedPost(id: string) {
  const { data } = await api.GET("/feed/posts/{id}", {
    params: { path: { id } },
  });

  return data!;
}

export async function createFeedPost(body: CreatePostInput, key: string) {
  const { data } = await api.POST("/feed/posts", {
    body,
    params: { header: { "Idempotency-Key": key } },
  });

  return data!;
}

export async function getFeedComments(id: string, cursor?: string) {
  const { data } = await api.GET("/feed/posts/{id}/comments", {
    params: { path: { id }, query: { cursor, limit: 20 } },
  });

  return data!;
}

export async function getCommentReplies(id: string, cursor?: string) {
  const { data } = await api.GET("/feed/comments/{id}/replies", {
    params: { path: { id }, query: { cursor, limit: 20 } },
  });

  return data!;
}

export async function createFeedComment({
  id,
  content,
  key,
  replyToCommentId,
}: {
  id: string;
  content: string;
  key: string;
  replyToCommentId?: string;
}) {
  const { data } = await api.POST("/feed/posts/{id}/comments", {
    params: { path: { id }, header: { "Idempotency-Key": key } },
    body: { content, replyToCommentId },
  });

  return data!;
}
