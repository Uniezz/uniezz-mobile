import type {
  PersonalDetailsFormValues,
  Profile,
  Programme,
  ProgrammeFormValues,
  ProgrammeInput,
} from "@/@types/profile";
import { vs } from "@/theme/scale";

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
});

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
