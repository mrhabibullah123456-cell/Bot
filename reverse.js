const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reverse')
    .setDescription('Reverses the provided text')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Text to reverse')
        .setRequired(true)),

  async execute(interaction) {
    const input = interaction.options.getString('text');
    const reversed = input.split('').reverse().join('');
    await interaction.reply(reversed);
  }
};