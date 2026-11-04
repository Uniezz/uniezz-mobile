import type { QueryClient } from "@tanstack/react-query";

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
