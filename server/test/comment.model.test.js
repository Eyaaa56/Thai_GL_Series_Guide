const test = require("node:test");
const assert = require("node:assert/strict");
const Comment = require("../src/models/comment.model");

test("comment model rejects an empty comment", () => {
  const comment = new Comment({ series: "507f1f77bcf86cd799439011", user: "507f1f77bcf86cd799439012", body: "   " });
  const error = comment.validateSync();
  assert.ok(error.errors.body);
});

test("comment model accepts a valid comment", () => {
  const comment = new Comment({ series: "507f1f77bcf86cd799439011", user: "507f1f77bcf86cd799439012", body: "ชอบมาก" });
  assert.equal(comment.validateSync(), undefined);
});
