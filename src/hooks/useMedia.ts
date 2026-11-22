import { useMutation } from "@tanstack/react-query";
import type { PickedImage, UploadKind } from "@/@types";
import { uploadImage } from "@/api";

export function useUploadImages(kind: UploadKind) {
  return useMutation({
    meta: { analyticsAction: "images_upload" },
    // one at a time: each photo is decoded into a bitmap of tens of MB while it is compressed
    mutationFn: async (images: PickedImage[]) => {
      const mediaIds: string[] = [];
      for (const image of images) mediaIds.push(await uploadImage(image, kind));
      return mediaIds;
    },
  });
}
