const test = require("node:test");
const assert = require("node:assert/strict");
const { authorize } = require("../src/middlewares/auth.middleware");

const run = (role) => new Promise((resolve) => {
  const req = { user: role ? { role } : undefined };
  const res = { status(code) { this.code = code; return this; }, json(body) { resolve({ code: this.code, body }); } };
  authorize("admin")(req, res, () => resolve({ next: true }));
});

test("allows an admin through the administrator middleware", async () => {
  assert.deepEqual(await run("admin"), { next: true });
});

test("rejects a normal user from administrator middleware", async () => {
  const result = await run("user");
  assert.equal(result.code, 403);
  assert.match(result.body.message, /Administrator/);
});
