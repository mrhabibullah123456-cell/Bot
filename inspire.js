const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("inspire")
    .setDescription("💡 Get a random motivational quote to brighten your day"),
  cooldown: 3,

  async execute(interaction, client) {
    await interaction.deferReply(); // Let Discord know we're working

    try {
      // Fetch a random motivational quote from ZenQuotes API
      const res = await axios.get("https://zenquotes.io/api/random");
      const quote = res.data[0].q;
      const author = res.data[0].a;

      // Create the embed message
      const embed = new EmbedBuilder()
        .setColor(client?.colors?.success || "#00FFAA")
        .setTitle("🌟 Inspiration of the Moment")
        .setDescription(`*"${quote}"*\n\n— **${author}**`)
        .setFooter({
          text: `Requested by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      // Send the embed response
      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error("❌ Failed to fetch quote:", error.message);
      await interaction.editReply({
        content: "❌ Couldn't fetch a quote right now. Please try again later.",
      });
    }
  },
};
