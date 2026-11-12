const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
} = require("discord.js");
const Database = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add-coins")
    .setDescription("Add coins to a member's wallet (Admin only).")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("The number of coins to add.")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(Number.MAX_SAFE_INTEGER)
    )
    .addUserOption((option) =>
      option
        .setName("member")
        .setDescription("Who should receive the coins? Defaults to you.")
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!interaction.inGuild()) {
      return interaction.reply({
        content: "This command can only be used in a server.",
        flags: MessageFlags.Ephemeral,
      });
    }

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: "Only server administrators can add coins.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const recipient = interaction.options.getUser("member") || interaction.user;
    if (recipient.bot) {
      return interaction.reply({
        content: "Coins can only be added to a human member.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const amount = interaction.options.getInteger("amount");
    const db = await Database.getInstance();
    const profile = await db.getUserProfile(recipient.id, interaction.guildId);
    const newWallet = (profile.wallet || 0) + amount;

    if (!Number.isSafeInteger(newWallet)) {
      return interaction.reply({
        content: "That amount would exceed the maximum supported wallet balance.",
        flags: MessageFlags.Ephemeral,
      });
    }

    profile.wallet = newWallet;
    await profile.save();

    const embed = new EmbedBuilder()
      .setColor("#2ECC71")
      .setTitle("✅ Coins Added")
      .setDescription(
        `Added **${amount.toLocaleString()}** coins to ${recipient.id === interaction.user.id ? "your" : `${recipient}'s`} wallet.`
      )
      .addFields({
        name: "New wallet balance",
        value: `**${newWallet.toLocaleString()}** coins`,
      })
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  },
};
