import { useMutation } from "@tanstack/react-query";
import type { PickedImage, UploadKind } from "@/@types/media";
import { uploadImage } from "@/api";

export function useUploadImages(kind: UploadKind) {
  return useMutation({
    mutationFn: (images: PickedImage[]) =>
      Promise.all(images.map((image) => uploadImage(image, kind))),
  });
}
