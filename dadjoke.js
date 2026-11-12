const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dadjoke")
    .setDescription("😂 Tell a silly dad joke to brighten the mood"),
  cooldown: 3,

  async execute(interaction, client) {
    const jokes = [
      "I used to be addicted to the hokey pokey, but then I turned myself around.",
      "Why don't skeletons fight each other? They don't have the guts.",
      "I told my computer I needed a break, and now it sends me to sleep mode.",
      "Parallel lines have so much in common. It's a shame they'll never meet.",
      "I used to hate facial hair, but then it grew on me.",
      "Why did the scarecrow win an award? Because he was outstanding in his field.",
      "My dog used to chase people on a bike, but it got tired. It was a real pedal pusher.",
      "I asked my plants how they were doing. They said they were thriving.",
      "I like telling chemistry jokes, but there is no reaction.",
      "I would tell you a construction joke, but I'm still working on it.",
    ];

    const joke = jokes[Math.floor(Math.random() * jokes.length)];

    const embed = new EmbedBuilder()
      .setColor(client.colors.warning)
      .setTitle("😂 Dad Joke Time")
      .setDescription(`**${joke}**`)
      .setFooter({
        text: `Shared by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
