import type { StartUsosLoginParams } from "@/@types/auth";
import { env } from "@/schemas";

export function getUsosStartUrl(
  university: StartUsosLoginParams["university"],
): string {
  const url = new URL("/auth/usos/start", env.EXPO_PUBLIC_API_URL);
  url.searchParams.set("university", university);
  url.searchParams.set("platform", "mobile");
  return url.toString();
}
