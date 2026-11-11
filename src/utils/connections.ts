import type { ConnectionMode } from "@/@types/connections";

export const CONNECTION_MODES = [
  ["friends", "app.friends", "face-slightly-smiling"],
  ["studyBuddy", "app.studyBuddy", "book-open"],
  ["dating", "app.dating", "heart"],
] as const satisfies readonly (readonly [ConnectionMode, string, string])[];

// the backend allows this many likes per 24 hours
export const DAILY_LIKE_LIMIT = 50;

export const CANDIDATE_ERRORS: Record<number, string> = {
  404: "connections.cardExpired",
  429: "connections.likeLimit",
};

export const CONNECTION_PREFERENCES_ERRORS: Record<number, string> = {
  400: "connections.datingRequiresAdult",
};
