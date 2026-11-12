const { Events } = require("discord.js");

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`🔌 Discord gateway connected as ${client.user.tag}`);
    console.log(`📊 Serving ${client.guilds.cache.size} servers`);
    console.log(`👥 Connected to ${client.users.cache.size} users`);

  },
};
