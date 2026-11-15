/// <reference types="node" />
import assert from "node:assert/strict";
import { test } from "node:test";
import { birthDateSchema } from "../src/schemas/connections";

const valid = (birthDate: Date | null) =>
  birthDateSchema.safeParse({ birthDate }).success;
const yearsAgo = (years: number, extraDays = 0) => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  date.setDate(date.getDate() + extraDays);
  return date;
};

test("birth date must be set and at least 16 years ago", () => {
  assert.equal(valid(yearsAgo(16)), true);
  assert.equal(valid(new Date(2000, 0, 15)), true);
  assert.equal(valid(yearsAgo(16, 1)), false);
  assert.equal(valid(null), false);
});
