import type { CreateReportInput } from "@/@types";
import { api } from "./client";

export async function createReport(body: CreateReportInput) {
  const { data } = await api.POST("/reports", { body });

  return data!;
}
