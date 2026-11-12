const { SlashCommandBuilder } = require('discord.js');
const { MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dm')
    .setDescription('Send yourself a private message')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The message you want to DM yourself')
        .setRequired(true)
    ),
  async execute(interaction) {
    const message = interaction.options.getString('message');

    try {
      await interaction.user.send(message);
      await interaction.reply({
        content: '📬 Message sent to your DMs!',
        flags: MessageFlags.Ephemeral
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: '❌ I couldn’t send you a DM. Do you have DMs enabled?',
        flags: MessageFlags.Ephemeral
      });
    }
  },
};
