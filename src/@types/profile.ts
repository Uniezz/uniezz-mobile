import type { components } from "./schema";
import type { ApiFeedPost } from "./feed";

export type Profile = components["schemas"]["Profile"];
export type Programme = components["schemas"]["Programme"];
export type UpdateProfileInput = components["schemas"]["UpdateMeBody"];
export type ProgrammeInput = components["schemas"]["ProgrammeRequest"];
export type PersonalDetailsFormValues = {
  firstName: string;
  lastName: string;
  bio: string;
  interests: string;
  gender: Profile["gender"];
  songUrl: string;
};
export type ProgrammeFormValues = { programme: string; faculty: string } & Pick<
  Programme,
  "yearOfStudy" | "level" | "modeOfStudies" | "status"
>;
/** programmes sheet: a programme's id to edit it, "new" for an empty form, null for the list */
export type ProgrammeSelection = Programme["id"] | "new" | null;
export type ProfileSummary = components["schemas"]["ProfileSummary"];
export type PublicProfile = components["schemas"]["PublicProfile"];
export type PublicProgramme = components["schemas"]["PublicProgramme"];
export type ProfileListItem = "overview" | "tabs" | ApiFeedPost;
export type ProfilePhoto = components["schemas"]["ProfilePhoto"];
export type ProfilePhotosList =
  components["schemas"]["ListProfilePhotosOutputBody"];
/** a photo in the profile strip; one with an id can be removed */
export type ProfileGalleryPhoto = { url: string; id?: string };
