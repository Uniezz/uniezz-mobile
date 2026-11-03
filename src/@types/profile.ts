import type { components } from "./schema";

export type Profile = components["schemas"]["Profile"];
export type Programme = components["schemas"]["Programme"];
export type ProgrammeInput = components["schemas"]["ProgrammeRequest"];
export type ProfileInput = components["schemas"]["UpdateMeInputBody"];
export type AvatarContentType =
  components["schemas"]["CreateUploadInputBody"]["contentType"];
