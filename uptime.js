const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('uptime')
    .setDescription('🕒 Shows how long the bot has been online'),

  async execute(interaction) {
    const totalSeconds = Math.floor(process.uptime());
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let uptimeString = '';
    if (days > 0) uptimeString += `${days}d `;
    if (hours > 0 || uptimeString) uptimeString += `${hours}h `;
    if (minutes > 0 || uptimeString) uptimeString += `${minutes}m `;
    uptimeString += `${seconds}s`;

    await interaction.reply(`✅ **Bot Uptime:** ${uptimeString}`);
  }
};
