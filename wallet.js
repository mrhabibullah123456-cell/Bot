const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
} = require("discord.js");
const Database = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("wallet")
    .setDescription("Check your wallet balance (admins can check other members).")
    .addUserOption((option) =>
      option
        .setName("member")
        .setDescription("Member to check (admin only; defaults to you).")
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!interaction.inGuild()) {
      return interaction.reply({
        content: "This command can only be used in a server.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const member = interaction.options.getUser("member") || interaction.user;
    const isAdmin = interaction.memberPermissions?.has(
      PermissionFlagsBits.Administrator
    );

    if (member.id !== interaction.user.id && !isAdmin) {
      return interaction.reply({
        content: "You can only check your own wallet. Only admins can check another member's wallet.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const db = await Database.getInstance();
    const profile = await db.getUserProfile(member.id, interaction.guildId);
    const wallet = profile.wallet || 0;

    const walletEmbed = new EmbedBuilder()
      .setColor("#FFD700")
      .setTitle(`👛 ${member.username}'s Wallet`)
      .setThumbnail(member.displayAvatarURL({ dynamic: true }))
      .setDescription(`**${wallet.toLocaleString()}** coins`)
      .setFooter({ text: `Requested by ${interaction.user.tag}` })
      .setTimestamp();

    return interaction.reply({ embeds: [walletEmbed] });
  },
};
