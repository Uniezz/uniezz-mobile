import {
  ImageManipulator,
  type ImageManipulatorContext,
  SaveFormat,
} from "expo-image-manipulator";
import type { UploadKind } from "@/@types";

export const MAX_IMAGE_MB: Record<UploadKind, number> = {
  avatar: 5,
  banner: 10,
  feed: 10,
  chat: 10,
  exam: 10,
};

export const MAX_POST_PHOTOS = 10;

// exam uploads also take PDFs, with a larger limit than images
export const MAX_EXAM_PDF_MB = 20;

// the longest side an image starts from before upload; exam photos start at full size so notes stay legible
export const MAX_IMAGE_EDGE: Record<UploadKind, number | null> = {
  avatar: 1600,
  banner: 2400,
  feed: 1600,
  chat: 1600,
  exam: null,
};

// the smallest longest side the size fitting goes down to
const MIN_IMAGE_EDGE = 320;

// arrayBuffer skips React Native's Blob, which copies the file through base64
export const readFileBytes = (uri: string) =>
  fetch(uri).then((response) => response.arrayBuffer());

// renders a manipulation and frees the context, which otherwise waits for the GC
const render = async (context: ImageManipulatorContext) => {
  try {
    return await context.renderAsync();
  } finally {
    context.release();
  }
};

// re-encodes any picked photo (HEIC, a Live Photo's still, PNG, WebP) as JPEG within its kind's size limit:
// it starts from the kind's longest side and shrinks it by a quarter until the file fits.
// Decoded bitmaps take tens of MB, so each is released as soon as it is saved
export const compressImage = async (uri: string, kind: UploadKind) => {
  const maxBytes = MAX_IMAGE_MB[kind] * 1024 * 1024;
  const original = await render(ImageManipulator.manipulate(uri));
  try {
    const isLandscape = original.width >= original.height;
    const longest = Math.max(original.width, original.height);
    let edge = Math.min(longest, MAX_IMAGE_EDGE[kind] ?? longest);
    for (;;) {
      const image =
        edge < longest
          ? await render(
              ImageManipulator.manipulate(original).resize(
                isLandscape ? { width: edge } : { height: edge },
              ),
            )
          : original;
      try {
        const saved = await image.saveAsync({
          compress: 0.8,
          format: SaveFormat.JPEG,
        });
        const bytes = await readFileBytes(saved.uri);
        // at the floor the caller's size check rejects what still does not fit
        if (bytes.byteLength <= maxBytes || edge <= MIN_IMAGE_EDGE) {
          return bytes;
        }
      } finally {
        if (image !== original) image.release();
      }
      edge = Math.max(Math.round(edge * 0.75), MIN_IMAGE_EDGE);
    }
  } finally {
    original.release();
  }
};
