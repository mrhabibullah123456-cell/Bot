const { SlashCommandBuilder } = require('discord.js');
const { MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resetnick')
    .setDescription('Reset your nickname to your original username'),
  async execute(interaction) {
    try {
      await interaction.member.setNickname(null);
      await interaction.reply({
        content: '🔄 Your nickname has been reset!',
        flags: MessageFlags.Ephemeral
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: '❌ I couldn’t reset your nickname. Do I have permission?',
        flags: MessageFlags.Ephemeral
      });
    }
  },
};
