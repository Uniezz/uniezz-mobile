import { hasAction, requestReview } from "expo-store-review";
import { createMMKV } from "react-native-mmkv";
import { REVIEW_AFTER_ACTIONS } from "@/utils";

const storage = createMMKV({ id: "store-review" });

// counts a successful action (REVIEW_ACTIONS) or a post open and, at the REVIEW_AFTER_ACTIONS-th, asks
// once for the system's rate-the-app sheet. The OS decides whether it shows (iOS caps it at 3 a year)
export async function countActionForReview() {
  if (storage.getBoolean("asked")) return;
  const count = (storage.getNumber("actions") ?? 0) + 1;
  storage.set("actions", count);
  if (count < REVIEW_AFTER_ACTIONS) return;
  try {
    if (!(await hasAction())) return;
    storage.set("asked", true);
    await requestReview();
  } catch {
    // the rating sheet is optional; it must never fail the action it follows
  }
}
