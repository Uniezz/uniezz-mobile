import type { components } from "./schema";

export type UploadKind = components["schemas"]["CreateUploadInputBody"]["kind"];
export type UploadContentType =
  components["schemas"]["CreateUploadInputBody"]["contentType"];

export type PickedImage = {
  uri: string;
  mimeType?: string | null;
  fileSize?: number | null;
};
