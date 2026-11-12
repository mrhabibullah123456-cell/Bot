// File: commands/general/ping.js
const { SlashCommandBuilder } = require('discord.js');
const { performance } = require('node:perf_hooks');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot and API latency'),

  async execute(interaction, client) {
    const apiPing = client.ws.ping;

    const start = performance.now();
    await interaction.reply({ content: '🏓 Pinging...', withResponse: true });
    const botPing = Math.round(performance.now() - start);

    await interaction.editReply(`🏓 **API Latency**: ${apiPing}ms\n🤖 **Bot Latency**: ${botPing}ms`);
  }
};