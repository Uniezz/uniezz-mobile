import type { MaterialTab } from "@/@types/study";

export const MATERIAL_TABS: readonly (readonly [MaterialTab, string])[] = [
  ["papers", "app.pastPapers"],
  ["reviews", "app.courseReviews"],
  ["professors", "app.professorRatings"],
];
