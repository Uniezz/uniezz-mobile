import type { StartUsosLoginParams } from "@/@types/auth";
import { env } from "@/schemas";
import type { ColorValue } from "react-native";

export function getUsosStartUrl(
  university: StartUsosLoginParams["university"],
): string {
  const url = new URL("/auth/usos/start", env.EXPO_PUBLIC_API_URL);
  url.searchParams.set("university", university);
  url.searchParams.set("platform", "mobile");
  return url.toString();
}

export const GRADIENT_COLORS: ColorValue[] = [
  "#0a1746",
  "#162760",
  "#2c4094",
  "#0a1745",
  "#192a66",
  "#303f99",
  "#0a1743",
  "#1c2e71",
  "#3e43b0",
];
export const GRADIENT_POINTS: number[][] = [
  [0, 0],
  [0.5, 0],
  [1, 0],
  [0, 0.5],
  [0.5, 0.5],
  [1, 0.5],
  [0, 1],
  [0.5, 1],
  [1, 1],
];
