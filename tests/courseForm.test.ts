/// <reference types="node" />
import assert from "node:assert/strict";
import { test } from "node:test";
import { canUploadCourseMaterial, toCourseValues } from "../src/utils/study";

const profile = {
  universityId: "umcs",
  programmes: [
    {
      id: "a",
      programme: "Informatyka",
      faculty: "Wydział MFI",
      isPrimary: false,
    },
    {
      id: "b",
      programme: "Matematyka",
      faculty: "Wydział MFI",
      isPrimary: true,
    },
  ],
} as never;

test("a new course starts in the primary programme with difficulty 3", () => {
  const values = toCourseValues(profile);
  assert.equal(values.faculty, "Wydział MFI");
  assert.equal(values.difficulty, 3);
  assert.equal(values.semester, 1);
});

test("materials need the student's university and primary programme", () => {
  const course = {
    universityId: "umcs",
    subject: " matematyka ",
    faculty: "wydział mfi",
  };
  assert.equal(canUploadCourseMaterial(profile, course), true);
  assert.equal(
    canUploadCourseMaterial(profile, { ...course, subject: "Informatyka" }),
    false,
  );
  assert.equal(
    canUploadCourseMaterial(profile, { ...course, universityId: "kul" }),
    false,
  );
  assert.equal(canUploadCourseMaterial(undefined, course), false);
});
