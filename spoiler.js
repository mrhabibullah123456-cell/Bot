const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('spoiler')
    .setDescription('Hide your message as a spoiler')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('The text to mark as spoiler')
        .setRequired(true)
    ),
  async execute(interaction) {
    const text = interaction.options.getString('text');
    await interaction.reply(`||${text}||`);
  },
};
