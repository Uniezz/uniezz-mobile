import type { PickedImage, UploadKind } from "@/@types/media";
import { isImageType, MAX_EXAM_PDF_MB, MAX_IMAGE_MB } from "@/utils/media";
import { api, ApiRequestError, apiError } from "./client";

export async function uploadImage(image: PickedImage, kind: UploadKind) {
  const size = image.fileSize ?? 0;
  const isPdf = kind === "exam" && image.mimeType === "application/pdf";
  const contentType = isImageType(image.mimeType)
    ? image.mimeType
    : isPdf
      ? "application/pdf"
      : null;
  if (
    !contentType ||
    size === 0 ||
    size > (isPdf ? MAX_EXAM_PDF_MB : MAX_IMAGE_MB[kind]) * 1024 * 1024
  ) {
    throw new ApiRequestError(
      "POST /media/uploads",
      "file type or size is not allowed",
      kind === "exam" ? "study.materialsHint" : "postComposer.photosError",
    );
  }
  const { data } = await api.POST("/media/uploads", {
    body: { kind, size, contentType },
  });
  // arrayBuffer skips React Native's Blob, which copies the file through base64
  const file = await fetch(image.uri).then((response) =>
    response.arrayBuffer(),
  );
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
