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
export type ProgrammeDetailsFormValues = Pick<
  Programme,
  "yearOfStudy" | "level" | "modeOfStudies" | "status"
>;
export type AddProgrammeFormValues = { programme: string; faculty: string };
export type PublicProfile = components["schemas"]["PublicProfile"];
export type PublicProgramme = components["schemas"]["PublicProgramme"];
