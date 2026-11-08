import type { components } from "./schema";

export type Profile = components["schemas"]["Profile"];
export type Programme = components["schemas"]["Programme"];
export type UpdateProfileInput = components["schemas"]["UpdateMeInputBody"];
export type ProgrammeInput = components["schemas"]["ProgrammeRequest"];
export type PersonalDetailsFormValues = {
  firstName: string;
  lastName: string;
  bio: string;
  interests: string;
  gender: Profile["gender"];
};
export type ProgrammeFormValues = { programme: string; faculty: string } & Pick<
  Programme,
  "yearOfStudy" | "level" | "modeOfStudies" | "status"
>;
/** programmes sheet: a programme's id to edit it, "new" for an empty form, null for the list */
export type ProgrammeSelection = Programme["id"] | "new" | null;
export type PublicProfile = components["schemas"]["PublicProfile"];
export type PublicProgramme = components["schemas"]["PublicProgramme"];
