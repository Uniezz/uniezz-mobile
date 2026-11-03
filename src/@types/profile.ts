import type { components } from "./schema";

export type Profile = components["schemas"]["Profile"];
export type Programme = components["schemas"]["Programme"];
export type UpdateProfileInput = components["schemas"]["UpdateMeInputBody"];
export type ProgrammeInput = components["schemas"]["ProgrammeRequest"];
export type PersonalDetailsFormValues = { firstName: string; lastName: string };
export type AddProgrammeFormValues = { programme: string; faculty: string };
