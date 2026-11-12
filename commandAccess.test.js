const test = require("node:test");
const assert = require("node:assert/strict");
const {
  COMMAND_ACCESS_DURATION_MS,
  COMMAND_ACCESS_PRICE,
  hasCommandAccess,
  requiresCommandAccess,
} = require("../utils/commandAccess");

test("command access price and duration match the shop pass", () => {
  assert.equal(COMMAND_ACCESS_PRICE, 10000);
  assert.equal(COMMAND_ACCESS_DURATION_MS, 30 * 24 * 60 * 60 * 1000);
});

test("an unexpired pass grants access and an expired or missing pass does not", () => {
  const now = Date.now();

  assert.equal(hasCommandAccess(new Date(now + 1000), now), true);
  assert.equal(hasCommandAccess(new Date(now), now), false);
  assert.equal(hasCommandAccess(null, now), false);
  assert.equal(hasCommandAccess("invalid date", now), false);
});

test("only the shop, purchase, earning, balance, and help commands are free", () => {
  for (const command of ["shop", "buy", "work", "bal", "wallet", "help"]) {
    assert.equal(requiresCommandAccess(command), false);
  }

  assert.equal(requiresCommandAccess("profile"), true);
});
