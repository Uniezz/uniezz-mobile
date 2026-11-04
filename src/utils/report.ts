import type { CreateReportInput } from "@/@types/report";

export const REPORT_REASONS = [
  ["spam", "report.spam"],
  ["harassment", "report.harassment"],
  ["inappropriate", "report.inappropriate"],
  ["hate_speech", "report.hateSpeech"],
  ["other", "report.other"],
] as const satisfies readonly (readonly [
  CreateReportInput["reason"],
  string,
])[];

export const REPORT_ERRORS: Record<number, string> = {
  409: "report.duplicate",
  429: "report.rateLimit",
};
