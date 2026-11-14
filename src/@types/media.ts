import type { components } from "./schema";

export type UploadKind = components["schemas"]["CreateUploadInputBody"]["kind"];
export type UploadContentType =
  components["schemas"]["CreateUploadInputBody"]["contentType"];

export type PickedImage = {
  uri: string;
  mimeType?: string | null;
  fileSize?: number | null;
};
// a picked document; its name becomes the attached material's title
export type PickedFile = PickedImage & { name: string };
