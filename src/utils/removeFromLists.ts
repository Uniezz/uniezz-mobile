import type { QueryClient, QueryKey } from "@tanstack/react-query";

type List<T> = { items?: T[] | null };

// Drops matching items from every cached list under the key, paged or not, without refetching every loaded page.
export function removeFromLists<T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  isRemoved: (item: T) => boolean,
): void {
  const drop = <L extends List<T>>(list: L) => ({
    ...list,
    items: list.items?.filter((item) => !isRemoved(item)) ?? list.items,
  });
  queryClient.setQueriesData<List<T> | { pages: List<T>[] }>(
    { queryKey },
    (data) => {
      if (!data) return data;
      return "pages" in data
        ? { ...data, pages: data.pages.map(drop) }
        : drop(data);
    },
  );
}
