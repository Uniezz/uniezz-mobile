import type {
  ConnectionFilterValues,
  ConnectionMode,
  ConnectionPreferences,
  ConnectionPreferencesFormValues,
  DiscoverFilters,
  StudyLevel,
} from "@/@types/connections";

export const CONNECTION_MODES = [
  ["friends", "app.friends", "face-slightly-smiling"],
  ["studyBuddy", "app.studyBuddy", "book-open"],
  ["dating", "app.dating", "heart"],
] as const satisfies readonly (readonly [ConnectionMode, string, string])[];

// the backend allows this many likes per 24 hours
export const DAILY_LIKE_LIMIT = 50;

export const CANDIDATE_ERRORS: Record<number, string> = {
  404: "connections.cardExpired",
  429: "connections.likeLimit",
};

export const CONNECTION_PREFERENCES_ERRORS: Record<number, string> = {
  400: "connections.datingRequiresAdult",
};

export const INITIAL_CONNECTION_FILTERS: ConnectionFilterValues = {
  gender: null,
  universities: [],
  faculty: null,
  levels: [],
  matchInterests: false,
};

export const CONNECTION_GENDERS = [
  [null, "connections.everyone"],
  ["female", "connections.women"],
  ["male", "connections.men"],
] as const satisfies readonly (readonly [
  ConnectionFilterValues["gender"],
  string,
])[];

// one Doctoral chip covers both PhD tracks, as on the web
export const STUDY_LEVEL_OPTIONS = [
  [["first_cycle"], "app.studyLevelFirstCycle"],
  [["second_cycle"], "app.studyLevelSecondCycle"],
  [["long_cycle"], "app.studyLevelLongCycle"],
  [["third_cycle", "phd_school"], "app.studyLevelDoctoral"],
] as const satisfies readonly (readonly [readonly StudyLevel[], string])[];

// removes the values when all are selected, otherwise adds the missing ones
export const toggleValues = <T>(list: T[], values: readonly T[]) =>
  values.every((value) => list.includes(value))
    ? list.filter((item) => !values.includes(item))
    : [...list, ...values.filter((value) => !list.includes(value))];

// empty filters are left out; faculty and level only narrow the study buddy search
export const toDiscoverFilters = (
  mode: ConnectionMode,
  {
    gender,
    universities,
    faculty,
    levels,
    matchInterests,
  }: ConnectionFilterValues,
): DiscoverFilters => {
  const isStudyBuddy = mode === "studyBuddy";
  return {
    mode,
    university: universities.length > 0 ? universities : undefined,
    faculty: isStudyBuddy && faculty ? faculty : undefined,
    level: isStudyBuddy && levels.length > 0 ? levels : undefined,
    gender: gender ?? undefined,
    sharedInterests: matchInterests || undefined,
  };
};

// birth dates travel as a calendar day ("2004-05-17"), read and written in local time so the day never shifts
export const toCalendarDay = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

export const fromCalendarDay = (day: string) => {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(year ?? 0, (month ?? 1) - 1, date ?? 1);
};

export const toPreferencesValues = (
  preferences?: ConnectionPreferences,
): ConnectionPreferencesFormValues => ({
  birthDate: preferences?.birthDate
    ? fromCalendarDay(preferences.birthDate)
    : null,
  intent: preferences?.intent ?? "",
});
