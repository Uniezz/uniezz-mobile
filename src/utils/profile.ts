import type { Href } from "expo-router";
import type {
  PersonalDetailsFormValues,
  Profile,
  Programme,
  ProgrammeFormValues,
  ProgrammeInput,
} from "@/@types";
import { vs } from "@/theme/scale";

// labels for UISegmented; index + 1 is the year
export const STUDY_YEARS = ["1", "2", "3", "4", "5", "6"];

export const STUDY_LEVELS = [
  ["first_cycle", "app.studyLevelFirstCycle"],
  ["second_cycle", "app.studyLevelSecondCycle"],
  ["long_cycle", "app.studyLevelLongCycle"],
  ["third_cycle", "app.studyLevelThirdCycle"],
  ["phd_school", "app.studyLevelPhdSchool"],
] as const;

export const STUDY_MODES = [
  ["full_time", "app.modeOfStudiesFullTime"],
  ["part_time", "app.modeOfStudiesPartTime"],
] as const;

export const STUDY_STATUSES = [
  ["active", "app.studyStatusActive"],
  ["graduated", "app.studyStatusGraduated"],
  ["suspended", "app.studyStatusSuspended"],
  ["cancelled", "app.studyStatusCancelled"],
] as const;

export const GENDERS = ["male", "female"] as const;

export const GENDER_LABELS = {
  male: "students.genderMale",
  female: "students.genderFemale",
} as const;

export const PRIVACY_SETTINGS = [
  ["showEmail", "apiState.showEmail"],
  ["showFaculty", "apiState.showFaculty"],
  ["showYear", "apiState.showYear"],
] as const;

export const splitInterests = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

// the personal details form starts from the saved profile
export const toDetailsValues = (
  profile: Profile,
): PersonalDetailsFormValues => ({
  firstName: profile.firstName ?? "",
  lastName: profile.lastName ?? "",
  bio: profile.bio ?? "",
  interests: (profile.interests ?? []).join(", "),
  gender: profile.gender,
  songUrl: profile.songUrl ?? "",
});

// shortcut: the API has no "new account" flag, so a profile created in the last 10 minutes
// counts as a first sign-in, as on web; switch when the sign-in response returns one
export const isNewProfile = (createdAt: string, now = Date.now()) =>
  now - Date.parse(createdAt) < 10 * 60_000;

// first sign-in onboarding, in web's order
export const ONBOARDING_STEPS = ["photo", "details", "programmes"] as const;

// how far the header titles slide while crossfading
export const PROFILE_HEADER_TITLE_SHIFT = vs(10);

// the programme form starts from the picked programme, or empty for a new one
export const toProgrammeValues = (
  programme?: Programme,
): ProgrammeFormValues => ({
  programme: programme?.programme ?? "",
  faculty: programme?.faculty ?? "",
  yearOfStudy: programme?.yearOfStudy ?? null,
  level: programme?.level ?? null,
  modeOfStudies: programme?.modeOfStudies ?? null,
  status: programme?.status ?? "active",
});

// the API takes missing optional fields as undefined, not null
export const toProgrammeBody = (
  values: ProgrammeFormValues,
  isPrimary: boolean,
): ProgrammeInput => ({
  programme: values.programme,
  faculty: values.faculty,
  status: values.status,
  isPrimary,
  yearOfStudy: values.yearOfStudy ?? undefined,
  level: values.level ?? undefined,
  modeOfStudies: values.modeOfStudies ?? undefined,
});

// a tapped author opens your own profile, or theirs
export const profileHref = (authorId: string, myId?: string): Href =>
  authorId === myId
    ? "/profile"
    : { pathname: "/student/[id]", params: { id: authorId } };
