import type { UploadContentType, UploadKind } from "@/@types/media";

export const IMAGE_TYPES: readonly UploadContentType[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const MAX_IMAGE_MB: Record<UploadKind, number> = {
  avatar: 5,
  banner: 10,
  feed: 10,
  chat: 10,
};

export const MAX_POST_PHOTOS = 10;

export const isImageType = (type?: string | null): type is UploadContentType =>
  IMAGE_TYPES.includes(type as UploadContentType);
