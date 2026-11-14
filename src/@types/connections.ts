import type { components, operations } from "./schema";

export type DiscoverCard = components["schemas"]["Card"];
export type Connection = components["schemas"]["Connection"];
export type ConnectionMode = Connection["mode"];
export type CandidateActionInput =
  components["schemas"]["ActOnCandidateInputBody"];
export type CandidateActionResult = components["schemas"]["ActionResult"];
export type ConnectionPreferences = components["schemas"]["Preferences"];
export type SaveConnectionPreferencesInput =
  components["schemas"]["SavePreferencesInputBody"];
export type DiscoverFilters = Omit<
  NonNullable<operations["discoverConnections"]["parameters"]["query"]>,
  "limit"
>;
export type DiscoverDeck = components["schemas"]["DiscoverOutputBody"];
export type StudyLevel = NonNullable<DiscoverFilters["level"]>[number];
export type ConnectionFilterValues = {
  gender: NonNullable<DiscoverFilters["gender"]> | null;
  universities: string[];
  faculty: string | null;
  levels: StudyLevel[];
  matchInterests: boolean;
};
export type ConnectionPreferencesFormValues = {
  birthDate: Date | null;
  intent: string;
};
