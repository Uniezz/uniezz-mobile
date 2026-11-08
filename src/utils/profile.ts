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
