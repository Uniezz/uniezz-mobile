import type { PickedImage, UploadKind } from "@/@types";
// not the @/utils barrel: utils/apiErrorKey imports @/api, so the barrel would cycle
import {
  compressImage,
  MAX_EXAM_PDF_MB,
  MAX_IMAGE_MB,
  readFileBytes,
} from "@/utils/media";
import { api, ApiRequestError, apiError } from "./client";

export async function uploadImage(image: PickedImage, kind: UploadKind) {
  const isPdf = kind === "exam" && image.mimeType === "application/pdf";
  const contentType = isPdf ? "application/pdf" : "image/jpeg";
  const errorKey =
    kind === "exam" ? "study.materialsHint" : "postComposer.photosError";
  // anything but a PDF is decoded as an image and sent as JPEG, so any photo format the device makes uploads
  const file = await (
    isPdf ? readFileBytes(image.uri) : compressImage(image.uri, kind)
  ).catch((error: unknown) => {
    throw new ApiRequestError(
      "POST /media/uploads",
      "file could not be read as an image",
      errorKey,
      error,
    );
  });
  const size = file.byteLength;
  if (
    size === 0 ||
    size > (isPdf ? MAX_EXAM_PDF_MB : MAX_IMAGE_MB[kind]) * 1024 * 1024
  ) {
    throw new ApiRequestError(
      "POST /media/uploads",
      "file size is not allowed",
      errorKey,
    );
  }
  const { data } = await api.POST("/media/uploads", {
    body: { kind, size, contentType },
  });
  const response = await fetch(data!.uploadUrl, {
    method: "PUT",
    headers: data!.headers,
    body: file,
  });
  if (!response.ok) {
    throw apiError(
      "PUT media upload",
      response,
      undefined,
      "postComposer.photosError",
    );
  }
  return data!.mediaId;
}
