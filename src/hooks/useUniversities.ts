import { getUniversities } from "@/api";
import { useQuery } from "@tanstack/react-query";

export function useUniversities() {
  return useQuery({
    staleTime: 60 * 60_000,
    gcTime: 2 * 60 * 60_000,
    queryKey: ["universities"],
    queryFn: getUniversities,
  });
}
