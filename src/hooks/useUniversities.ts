import { getUniversities } from "@/api";
import { useQuery } from "@tanstack/react-query";

export function useUniversities() {
  return useQuery({
    queryKey: ["universities"],
    queryFn: getUniversities,
    staleTime: 5 * 60 * 1000,
  });
}
