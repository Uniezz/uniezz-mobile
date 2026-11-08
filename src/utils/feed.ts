import type { Transition } from "react-native-ease";
import { vs } from "@/theme/scale";

export const FEED_TYPES = ["all", "announcement", "question", "event"] as const;

export const FEED_TYPE_LABELS = {
  all: "app.all",
  announcement: "feed.filters.news",
  question: "app.question",
  event: "app.event",
} as const;

export const authorName = (author?: {
  firstName: string | null;
  lastName: string | null;
}) => [author?.firstName, author?.lastName].filter(Boolean).join(" ");

export const postDate = (
  post: { eventDate: string | null; createdAt: string },
  locale: string,
) => {
  const date = new Date(post.eventDate ?? post.createdAt);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat(locale, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
};

// an event counts as live from its start until 2 hours later
export const isLive = (eventDate: string | null, now = Date.now()) => {
  const start = eventDate ? new Date(eventDate).getTime() : NaN;
  return start <= now && now < start + 2 * 60 * 60 * 1000;
};

const DAY = 24 * 60 * 60 * 1000;

export const DATE_PRESETS = [
  ["any", "feed.anyTime", null],
  ["today", "feed.today", 0],
  ["week", "feed.lastWeek", 6],
  ["month", "feed.lastMonth", 29],
] as const;

// midnight N days ago, so the value (and the query key) stays the same all day
export const datePresetFrom = (days: number | null) => {
  if (days === null) return undefined;
  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);
  return new Date(midnight.getTime() - days * DAY).toISOString();
};

// feed header: scroll offset past which it turns compact, in pt
export const FEED_HEADER_COMPACT_OFFSET = vs(24);
// the row may only rise into the room the subtitle leaves above the 40pt buttons (subtitle + gap + title − 40),
// so it never moves into rt.insets.top; the bottom padding shrinks 4pt more
export const FEED_HEADER_ROW_LIFT = vs(7);
export const FEED_HEADER_COLLAPSE_HEIGHT = FEED_HEADER_ROW_LIFT + vs(4);
// compact "Posty" (26pt line × 0.92) is bottom-aligned with 40pt buttons; lifting it this much centers it on them
export const FEED_HEADER_TITLE_LIFT = vs(8);
export const FEED_HEADER_TITLE_SCALE = 0.92;
// shrinks from its left edge so it stays aligned with the subtitle
export const FEED_HEADER_TITLE_ORIGIN = { x: 0, y: 1 };
export const FEED_HEADER_TRANSITION: Transition = {
  type: "timing",
  duration: 220,
  easing: "easeOut",
};
