import type { CourseFileType, MaterialTab } from "@/@types/study";

export const MATERIAL_TABS: readonly (readonly [MaterialTab, string])[] = [
  ["papers", "app.pastPapers"],
  ["reviews", "app.courseReviews"],
  ["professors", "app.professorRatings"],
];

export const FILE_TYPES = {
  exam: ["study.typeExam", "file-check"],
  colloquium: ["study.typeColloquium", "clipboard-list"],
  lab: ["study.typeLab", "flask-conical"],
  notes: ["study.typeNotes", "notebook-pen"],
} as const satisfies Record<CourseFileType, readonly [string, string]>;

// shared by courses, files and comments: 30 creates per hour
export const STUDY_CREATE_ERRORS: Record<number, string> = {
  429: "study.rateLimit",
};
