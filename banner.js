const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('banner')
    .setDescription("Displays the server's banner image if set."),
  async execute(interaction) {
    const banner = interaction.guild.bannerURL({ size: 1024 });
    if (!banner) {
      return await interaction.reply("❌ No banner is set for this server.");
    }
    await interaction.reply(banner);
  },
};
