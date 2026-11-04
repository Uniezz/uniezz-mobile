import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getProfiles, getPublicProfile } from "@/api";

export function useProfileSearch(name: string) {
  return useInfiniteQuery({
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    queryKey: ["profiles", "search", name],
    queryFn: ({ pageParam }) => getProfiles(name, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
}

export function usePublicProfile(id: string) {
  return useQuery({
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    queryKey: ["profiles", id],
    queryFn: () => getPublicProfile(id),
  });
}
