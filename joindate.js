const { SlashCommandBuilder } = require('discord.js');
const { time } = require('@discordjs/builders');
const { MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('joindate')
    .setDescription("Check when you or someone else joined this server")
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user to check (optional)')
        .setRequired(false)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = await interaction.guild.members.fetch(user.id);

    if (!member) {
      return interaction.reply({
        content: '❌ Could not find that user in this server.',
        flags: MessageFlags.Ephemeral
      });
    }

    const joinedAt = member.joinedAt;
    await interaction.reply(
      `📅 **${user.username}** joined this server on **${time(joinedAt, 'F')}**`
    );
  }
};
