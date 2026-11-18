import type { QueryClient } from "@tanstack/react-query";
import type { Author } from "@/@types";

type AuthorPatch = Pick<Author, "firstName" | "lastName" | "avatarUrl">;

const patchAuthorOnRecord = (
  item: unknown,
  authorId: string,
  patch: Partial<AuthorPatch>,
): unknown => {
  if (!item || typeof item !== "object") return item;
  const record = item as { author?: Author };
  if (record.author?.id !== authorId) return item;
  return { ...record, author: { ...record.author, ...patch } };
};

const patchFeedAuthorData = (
  data: unknown,
  authorId: string,
  patch: Partial<AuthorPatch>,
): unknown => {
  if (!data || typeof data !== "object") return data;
  if (!("pages" in data) || !Array.isArray(data.pages)) {
    return patchAuthorOnRecord(data, authorId, patch);
  }
  return {
    ...data,
    pages: data.pages.map((page: { items?: unknown[] | null }) => ({
      ...page,
      items:
        page.items?.map((item) => patchAuthorOnRecord(item, authorId, patch)) ??
        page.items,
    })),
  };
};

// Posts and comments in every loaded feed query for one author.
export function patchFeedAuthor(
  queryClient: QueryClient,
  authorId: string,
  patch: Partial<AuthorPatch>,
) {
  queryClient.setQueriesData({ queryKey: ["feed"] }, (data: unknown) =>
    patchFeedAuthorData(data, authorId, patch),
  );
}

// Patch cached pages and detail queries without refetching every loaded page.
export function patchFeedItem(
  queryClient: QueryClient,
  id: string,
  patch: Record<string, unknown>,
): void {
  const update = (item: unknown) =>
    item && typeof item === "object" && "id" in item && item.id === id
      ? { ...item, ...patch }
      : item;
  queryClient.setQueriesData({ queryKey: ["feed"] }, (data: unknown) => {
    if (
      !data ||
      typeof data !== "object" ||
      !("pages" in data) ||
      !Array.isArray(data.pages)
    ) {
      return update(data);
    }
    return {
      ...data,
      pages: data.pages.map((page: { items?: unknown[] | null }) => ({
        ...page,
        items: page.items?.map(update) ?? page.items,
      })),
    };
  });
}
