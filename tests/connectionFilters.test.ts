/// <reference types="node" />
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  INITIAL_CONNECTION_FILTERS,
  toCalendarDay,
  toDiscoverFilters,
  toggleValues,
} from "../src/utils/connections";

test("leaves empty filters out of the discover query", () => {
  assert.deepEqual(toDiscoverFilters("friends", INITIAL_CONNECTION_FILTERS), {
    mode: "friends",
    university: undefined,
    faculty: undefined,
    level: undefined,
    gender: undefined,
    sharedInterests: undefined,
  });
});

test("sends faculty and level only for study buddies", () => {
  const values = {
    ...INITIAL_CONNECTION_FILTERS,
    universities: ["umcs"],
    faculty: "Informatyka",
    levels: ["first_cycle" as const],
    gender: "female" as const,
    matchInterests: true,
  };
  assert.deepEqual(toDiscoverFilters("dating", values), {
    mode: "dating",
    university: ["umcs"],
    faculty: undefined,
    level: undefined,
    gender: "female",
    sharedInterests: true,
  });
  const studyBuddy = toDiscoverFilters("studyBuddy", values);
  assert.equal(studyBuddy.faculty, "Informatyka");
  assert.deepEqual(studyBuddy.level, ["first_cycle"]);
});

test("toggles a group of values together", () => {
  assert.deepEqual(toggleValues(["a"], ["b", "c"]), ["a", "b", "c"]);
  assert.deepEqual(toggleValues(["a", "b", "c"], ["b", "c"]), ["a"]);
  assert.deepEqual(toggleValues(["b"], ["b", "c"]), ["b", "c"]);
});

test("writes a birth date as its local calendar day", () => {
  assert.equal(toCalendarDay(new Date(2004, 0, 9)), "2004-01-09");
});
