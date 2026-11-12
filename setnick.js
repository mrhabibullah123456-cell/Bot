const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setnick')
    .setDescription('Change your display name (nickname) in the server')
    .addStringOption(option =>
      option.setName('nickname')
        .setDescription('The new nickname you want')
        .setRequired(true)
    ),
  async execute(interaction) {
    const newNickname = interaction.options.getString('nickname');

    try {
      // Attempt to change the nickname of the user
      await interaction.member.setNickname(newNickname);

      await interaction.reply({
        content: `✅ Nickname changed to **${newNickname}**!`,
        flags: MessageFlags.Ephemeral
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: '❌ I was unable to change your nickname. Do I have permission?',
        flags: MessageFlags.Ephemeral
      });
    }
  }
};
