import type { FeedFilterValues } from "@/@types/feed";

export const FEED_TYPES = ["all", "announcement", "question", "event"] as const;

export const INITIAL_FILTERS: FeedFilterValues = {
  type: "all",
  university: null,
  date: "any",
};

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

// tags may be stored with or without their "#"; shown with exactly one
export const formatTag = (tag: string) => `#${tag.replace(/^#+/, "")}`;
