import type { StartUsosLoginParams } from "@/@types";
// a file, not the @/schemas barrel: schemas imports utils back, so the barrel cycles
import { env } from "@/schemas/env";

export function getUsosStartUrl({
  university,
  referralCode,
}: Pick<StartUsosLoginParams, "university" | "referralCode">): string {
  const url = new URL("/auth/usos/start", env.EXPO_PUBLIC_API_URL);
  url.searchParams.set("university", university);
  url.searchParams.set("platform", "mobile");
  if (referralCode) {
    url.searchParams.set("referralCode", referralCode);
  }
  return url.toString();
}
