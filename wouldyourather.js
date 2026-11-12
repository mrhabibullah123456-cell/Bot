const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("wouldyourather")
    .setDescription("🤔 Get a random 'would you rather' question for a fun debate"),
  cooldown: 2,

  async execute(interaction, client) {
    const prompts = [
      {
        question: "Would you rather have the ability to fly or become invisible?",
        optionA: "Fly anywhere you want",
        optionB: "Disappear whenever you want",
      },
      {
        question: "Would you rather live in a huge mansion or a cozy cabin in the woods?",
        optionA: "Massive mansion",
        optionB: "Cozy cabin",
      },
      {
        question: "Would you rather always be 10 minutes early or 10 minutes late?",
        optionA: "Always early",
        optionB: "Always late",
      },
      {
        question: "Would you rather have a robot assistant or a dragon pet?",
        optionA: "Robot assistant",
        optionB: "Dragon pet",
      },
      {
        question: "Would you rather never use social media again or never watch TV again?",
        optionA: "No social media",
        optionB: "No TV",
      },
      {
        question: "Would you rather be able to speak every language or play every instrument?",
        optionA: "Speak every language",
        optionB: "Play every instrument",
      },
    ];

    const prompt = prompts[Math.floor(Math.random() * prompts.length)];

    const embed = new EmbedBuilder()
      .setColor(client.colors.accent)
      .setTitle("🤔 Would You Rather?")
      .setDescription(`**${prompt.question}**`)
      .addFields(
        {
          name: "Option A",
          value: `👉 ${prompt.optionA}`,
          inline: true,
        },
        {
          name: "Option B",
          value: `👉 ${prompt.optionB}`,
          inline: true,
        }
      )
      .setFooter({
        text: `Asked by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
