const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("flipcoin")
    .setDescription("🪙 Flip a coin and see whether it lands on heads or tails"),
  cooldown: 2,

  async execute(interaction, client) {
    const result = Math.random() < 0.5 ? "heads" : "tails";
    const outcome = {
      heads: {
        emoji: "🪙",
        label: "Heads",
        color: client.colors.success,
        text: "The coin lands on heads!",
      },
      tails: {
        emoji: "🪙",
        label: "Tails",
        color: client.colors.primary,
        text: "The coin lands on tails!",
      },
    }[result];

    const embed = new EmbedBuilder()
      .setColor(outcome.color)
      .setTitle("🪙 Coin Flip")
      .setDescription(`${outcome.emoji} **${outcome.label}**\n${outcome.text}`)
      .setFooter({
        text: `Flipped for ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
