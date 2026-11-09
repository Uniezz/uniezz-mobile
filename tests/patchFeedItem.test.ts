/// <reference types="node" />
import assert from "node:assert/strict";
import { test } from "node:test";
import { QueryClient } from "@tanstack/react-query";
import { patchFeedItem } from "../src/hooks/patchFeedItem";

const post = (id: string, likesCount = 0) => ({
  id,
  likesCount,
  likedByMe: false,
  title: `post ${id}`,
});

test("patches a matching item across every page of an infinite feed query", () => {
  const client = new QueryClient();
  const untouched = post("a");
  const liked = post("b");
  const other = post("c");
  client.setQueryData(["feed", "posts", {}], {
    pages: [
      { items: [untouched, liked], nextCursor: "next" },
      { items: [other], nextCursor: null },
    ],
    pageParams: [undefined, "next"],
  });

  patchFeedItem(client, "b", { likedByMe: true, likesCount: 1 });

  const data = client.getQueryData<{
    pages: { items: ReturnType<typeof post>[]; nextCursor: string | null }[];
    pageParams: unknown[];
  }>(["feed", "posts", {}]);
  assert.deepEqual(data?.pages[0]?.items, [
    untouched,
    { ...liked, likedByMe: true, likesCount: 1 },
  ]);
  assert.deepEqual(data?.pages[1]?.items, [other]);
  assert.deepEqual(data?.pageParams, [undefined, "next"]);
});

test("patches a feed detail query that is a single item", () => {
  const client = new QueryClient();
  client.setQueryData(["feed", "post", "b"], post("b"));

  patchFeedItem(client, "b", { likesCount: 2 });

  assert.deepEqual(client.getQueryData(["feed", "post", "b"]), {
    ...post("b"),
    likesCount: 2,
  });
});

test("leaves other queries, missing matches, and empty pages untouched", () => {
  const client = new QueryClient();
  const detail = post("b");
  client.setQueryData(["feed", "post", "b"], detail);
  client.setQueryData(["profile", "me"], { id: "b", likesCount: 0 });
  client.setQueryData(["feed", "posts", {}], {
    pages: [{ items: [post("a")], nextCursor: null }, { items: null }],
    pageParams: [undefined],
  });

  patchFeedItem(client, "missing", { likesCount: 99 });

  assert.deepEqual(client.getQueryData(["feed", "post", "b"]), detail);
  assert.deepEqual(client.getQueryData(["profile", "me"]), {
    id: "b",
    likesCount: 0,
  });
  assert.deepEqual(client.getQueryData(["feed", "posts", {}]), {
    pages: [{ items: [post("a")], nextCursor: null }, { items: null }],
    pageParams: [undefined],
  });
});

test("keeps non-object feed data (such as null) unchanged", () => {
  const client = new QueryClient();
  client.setQueryData(["feed", "featured"], null);

  patchFeedItem(client, "b", { likesCount: 3 });

  assert.equal(client.getQueryData(["feed", "featured"]), null);
});
