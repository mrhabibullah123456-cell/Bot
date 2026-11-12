const COMMAND_ACCESS_PRICE = 10000;
const COMMAND_ACCESS_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
const COMMAND_ACCESS_ITEM_NAME = "Command Access (30 days)";

const FREE_COMMANDS = new Set(["shop", "buy", "work", "bal", "wallet", "help"]);

function hasCommandAccess(expiresAt, now = Date.now()) {
  const expirationTime = expiresAt ? new Date(expiresAt).getTime() : NaN;
  return Number.isFinite(expirationTime) && expirationTime > now;
}

function requiresCommandAccess(commandName) {
  return !FREE_COMMANDS.has(commandName);
}

module.exports = {
  COMMAND_ACCESS_PRICE,
  COMMAND_ACCESS_DURATION_MS,
  COMMAND_ACCESS_ITEM_NAME,
  hasCommandAccess,
  requiresCommandAccess,
};
