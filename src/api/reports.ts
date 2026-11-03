import type { CreateReportInput } from "@/@types/report";
import { api } from "./client";

export async function createReport(body: CreateReportInput) {
  const { data } = await api.POST("/reports", { body });

  return data!;
}
