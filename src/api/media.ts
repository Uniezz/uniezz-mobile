import type { PickedImage, UploadKind } from "@/@types/media";
import { isImageType, MAX_IMAGE_MB } from "@/utils/media";
import { api, ApiRequestError, apiError } from "./client";

export async function uploadImage(image: PickedImage, kind: UploadKind) {
  const size = image.fileSize ?? 0;
  if (
    !isImageType(image.mimeType) ||
    size === 0 ||
    size > MAX_IMAGE_MB[kind] * 1024 * 1024
  ) {
    throw new ApiRequestError(
      "POST /media/uploads",
      "image type or size is not allowed",
      "postComposer.photosError",
    );
  }
  const { data } = await api.POST("/media/uploads", {
    body: { kind, size, contentType: image.mimeType },
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
