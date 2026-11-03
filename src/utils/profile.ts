import type { Programme, ProgrammeInput } from "@/@types/profile";
import type { ProgrammeFormValues } from "@/schemas/profile";

export function getProgrammeInput(
  draft: ProgrammeFormValues,
  original?: Programme,
): ProgrammeInput {
  const year = draft.yearOfStudy.trim();

  return {
    faculty: draft.faculty.trim(),
    programme: draft.programme.trim(),
    status: original?.status ?? "active",
    isPrimary: draft.isPrimary,
    ...(year ? { yearOfStudy: Number(year) } : {}),
    ...(original?.level ? { level: original.level } : {}),
    ...(original?.modeOfStudies
      ? { modeOfStudies: original.modeOfStudies }
      : {}),
  };
}
