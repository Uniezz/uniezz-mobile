import type { Transition } from "react-native-ease";
import { vs } from "@/theme/scale";

// pinned screen header (UICollapsingHeader): turns compact once its list scrolls
// scroll offset past which it turns compact, in pt
export const HEADER_COMPACT_OFFSET = vs(24);
// the row may only rise into the room the subtitle leaves above the 40pt buttons (subtitle + gap + title − 40),
// so it never moves into rt.insets.top; the bottom padding shrinks 4pt more
export const HEADER_ROW_LIFT = vs(7);
export const HEADER_COLLAPSE_HEIGHT = HEADER_ROW_LIFT + vs(4);
// compact "Posty" (26pt line × 0.92) is bottom-aligned with 40pt buttons; lifting it this much centers it on them
export const HEADER_TITLE_LIFT = vs(8);
export const HEADER_TITLE_SCALE = 0.92;
// shrinks from its left edge so it stays aligned with the subtitle
export const HEADER_TITLE_ORIGIN = { x: 0, y: 1 };
export const HEADER_TRANSITION: Transition = {
  type: "timing",
  duration: 220,
  easing: "easeOut",
};
