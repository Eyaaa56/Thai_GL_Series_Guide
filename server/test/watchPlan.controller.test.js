const test = require("node:test");
const assert = require("node:assert/strict");
const { toggleEpisode } = require("../src/controllers/watchPlan.controller");

test("marks an episode complete and keeps episode numbers ordered", () => {
  assert.deepEqual(toggleEpisode([3, 1], 2, true), [1, 2, 3]);
});

test("does not duplicate an already completed episode", () => {
  assert.deepEqual(toggleEpisode([1, 2], 2, true), [1, 2]);
});

test("unmarks a completed episode", () => {
  assert.deepEqual(toggleEpisode([1, 2, 3], 2, false), [1, 3]);
});
