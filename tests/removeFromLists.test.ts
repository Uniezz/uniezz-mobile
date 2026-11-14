/// <reference types="node" />
import assert from "node:assert/strict";
import { test } from "node:test";
import { QueryClient } from "@tanstack/react-query";
import { removeFromLists } from "../src/utils/removeFromLists";

test("drops the item from paged and plain lists under the key only", () => {
  const queryClient = new QueryClient();
  const isB = (item: { id: string }) => item.id === "b";
  queryClient.setQueryData(["feed", "posts", {}], {
    pages: [{ items: [{ id: "a" }, { id: "b" }] }, { items: null }],
    pageParams: [undefined, "x"],
  });
  queryClient.setQueryData(["feed", "featured"], { items: [{ id: "b" }] });
  queryClient.setQueryData(["study", "files"], { items: [{ id: "b" }] });

  removeFromLists(queryClient, ["feed", "posts"], isB);
  removeFromLists(queryClient, ["feed", "featured"], isB);

  assert.deepEqual(queryClient.getQueryData(["feed", "posts", {}]), {
    pages: [{ items: [{ id: "a" }] }, { items: null }],
    pageParams: [undefined, "x"],
  });
  assert.deepEqual(queryClient.getQueryData(["feed", "featured"]), {
    items: [],
  });
  assert.deepEqual(queryClient.getQueryData(["study", "files"]), {
    items: [{ id: "b" }],
  });
});
