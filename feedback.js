const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("feedback")
    .setDescription(
      "📝 Submit feedback about the bot using an interactive form"
    ),
  cooldown: 30,

  async execute(interaction, client) {
    // 🎨 Create feedback introduction embed
    const feedbackEmbed = new EmbedBuilder()
      .setColor(client.colors.primary)
      .setTitle("📝 Feedback & Suggestions")
      .setDescription(
        "**We value your input!** 💫\n\n" +
          "Help us improve Nova Bot by sharing your thoughts, reporting bugs, " +
          "or suggesting new features. Your feedback drives our development!\n\n" +
          "📋 **What you can submit:**\n" +
          "• 🐛 Bug reports and issues\n" +
          "• ✨ Feature requests and ideas\n" +
          "• 💡 General suggestions\n" +
          "• 🎯 User experience feedback\n\n" +
          "Click the button below to open the feedback form!"
      )
      .addFields(
        {
          name: "⚡ Quick Tips",
          value:
            "• Be specific and detailed\n• Include steps to reproduce bugs\n• Explain how features would help you",
          inline: true,
        },
        {
          name: "🔒 Privacy",
          value:
            "Your Discord info is included to help us follow up if needed.",
          inline: true,
        }
      )
      .setThumbnail(client.user.displayAvatarURL())
      .setFooter({
        text: "Thank you for helping us improve!",
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    // 📝 Create feedback form button
    const feedbackRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("feedback_modal")
        .setLabel("📝 Open Feedback Form")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("📋")
    );

    await interaction.reply({
      embeds: [feedbackEmbed],
      components: [feedbackRow],
      flags: 64, // MessageFlags.Ephemeral
    });
  },
};
