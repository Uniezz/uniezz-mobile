/// <reference types="node" />
import assert from "node:assert/strict";
import { test } from "node:test";
// @ts-expect-error bun's own module; the project has no bun type declarations
import { mock } from "bun:test";

// a fake image whose saved JPEG weighs one byte per pixel, so the loop's shrinking is observable
type FakeImage = { width: number; height: number };
const saved: FakeImage[] = [];
// every native object created, so a test can check each one was released
let created = 0;
let released = 0;
const release = () => {
  released += 1;
};
const toRef = (image: FakeImage) => ({
  ...image,
  release,
  saveAsync: async () => {
    saved.push(image);
    return { uri: `${image.width}x${image.height}` };
  },
});
const manipulate = (source: string | FakeImage) => {
  const image =
    typeof source === "string"
      ? (() => {
          const [width, height] = source.split("x").map(Number);
          return { width: width ?? 0, height: height ?? 0 };
        })()
      : source;
  let size = image;
  created += 2; // the context and the image it renders
  const context = {
    release,
    resize: ({ width, height }: { width?: number; height?: number }) => {
      const ratio = width
        ? width / image.width
        : (height ?? image.height) / image.height;
      size = {
        width: Math.round(image.width * ratio),
        height: Math.round(image.height * ratio),
      };
      return context;
    },
    renderAsync: async () => toRef(size),
  };
  return context;
};
mock.module("expo-image-manipulator", () => ({
  ImageManipulator: { manipulate },
  SaveFormat: { JPEG: "jpeg" },
}));
globalThis.fetch = (async (input: string) => {
  const [width, height] = input.split("x").map(Number);
  return new Response(new Uint8Array((width ?? 0) * (height ?? 0)));
}) as unknown as typeof fetch;

const { compressImage } = await import("../src/utils/media");

test("starts from the kind's longest side and keeps the ratio", async () => {
  saved.length = 0;
  const bytes = await compressImage("4000x3000", "feed");

  assert.deepEqual(saved, [{ width: 1600, height: 1200 }]);
  assert.equal(bytes.byteLength, 1600 * 1200);
});

test("shrinks a portrait photo until it fits the limit", async () => {
  saved.length = 0;
  // exam photos start at full size: 4000x6000 is 24 MB, over the 10 MB limit
  const bytes = await compressImage("4000x6000", "exam");

  assert.ok(bytes.byteLength <= 10 * 1024 * 1024);
  assert.ok(saved.length > 1);
  assert.equal(saved[0]?.height, 6000);
  assert.ok(saved.every((image) => image.height > image.width));
});

test("releases every bitmap and context it creates", async () => {
  created = 0;
  released = 0;
  await compressImage("4000x6000", "exam");

  assert.ok(created > 2);
  assert.equal(released, created);
});

test("does not upscale a small photo", async () => {
  saved.length = 0;
  await compressImage("800x600", "avatar");

  assert.deepEqual(saved, [{ width: 800, height: 600 }]);
});
