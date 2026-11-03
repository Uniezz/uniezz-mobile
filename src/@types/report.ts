import type { components } from "./schema";

export type CreateReportInput = components["schemas"]["CreateReportInputBody"];
export type ReportFormValues = {
  reason: CreateReportInput["reason"];
  details: string;
};
