import { $api } from "@/api";
import { useSession } from "@/contexts";

export function useExchangeLoginCode() {
  const { saveSession } = useSession();

  return $api.useMutation("post", "/auth/exchange", {
    onSuccess: saveSession,
  });
}
