const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roll")
    .setDescription(
      "🎲 Roll dice with animated results (supports multiple dice formats)"
    )
    .addStringOption((option) =>
      option
        .setName("dice")
        .setDescription("Dice format (e.g., 1d6, 2d20, 3d8+5)")
        .setRequired(false)
    ),
  cooldown: 2,
  async execute(interaction, client) {
    const diceInput = interaction.options.getString("dice") || "1d6";

    // 🎯 Parse dice notation (XdY+Z or XdY-Z or XdY)
    const diceRegex = /^(\d+)d(\d+)([+-]\d+)?$/i;
    const match = diceInput.match(diceRegex);

    if (!match) {
      const errorEmbed = new EmbedBuilder()
        .setColor(client.colors.error)
        .setTitle("❌ Invalid Dice Format")
        .setDescription(
          "Please use proper dice notation!\n\n**Examples:**\n• `1d6` - Roll one 6-sided die\n• `2d20` - Roll two 20-sided dice\n• `3d8+5` - Roll three 8-sided dice and add 5\n• `1d100-10` - Roll one 100-sided die and subtract 10"
        )
        .setFooter({ text: "Try again with the correct format!" });

      return interaction.reply({ embeds: [errorEmbed], flags: 64 }); // MessageFlags.Ephemeral
    }

    const numDice = parseInt(match[1]);
    const diceSize = parseInt(match[2]);
    const modifier = match[3] ? parseInt(match[3]) : 0;

    // 🛡️ Validation
    if (numDice > 20) {
      const limitEmbed = new EmbedBuilder()
        .setColor(client.colors.warning)
        .setTitle("⚠️ Too Many Dice!")
        .setDescription("Maximum 20 dice per roll for performance reasons.")
        .setFooter({ text: "Try rolling fewer dice!" });

      return interaction.reply({ embeds: [limitEmbed], flags: 64 }); // MessageFlags.Ephemeral
    }

    if (diceSize < 2 || diceSize > 1000) {
      const sizeEmbed = new EmbedBuilder()
        .setColor(client.colors.warning)
        .setTitle("⚠️ Invalid Dice Size!")
        .setDescription("Dice must be between 2 and 1000 sides.")
        .setFooter({ text: "Try a different dice size!" });

      return interaction.reply({ embeds: [sizeEmbed], flags: 64 }); // MessageFlags.Ephemeral
    }

    // 🎲 Roll the dice
    const rolls = [];
    let total = 0;

    for (let i = 0; i < numDice; i++) {
      const roll = Math.floor(Math.random() * diceSize) + 1;
      rolls.push(roll);
      total += roll;
    }

    const finalTotal = total + modifier;

    // 🎨 Create visual representation
    const diceEmojis = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
    const rollDisplay = rolls
      .map((roll) => {
        if (diceSize === 6 && roll <= 6) {
          return diceEmojis[roll - 1];
        }
        return `**${roll}**`;
      })
      .join(" ");

    // 🏆 Determine if it's a critical roll
    const maxPossible = numDice * diceSize + modifier;
    const minPossible = numDice + modifier;
    const isCriticalSuccess = finalTotal === maxPossible;
    const isCriticalFailure = finalTotal === minPossible;

    let embedColor = client.colors.primary;
    let specialText = "";

    if (isCriticalSuccess) {
      embedColor = client.colors.success;
      specialText = " 🎉 **CRITICAL SUCCESS!** 🎉";
    } else if (isCriticalFailure) {
      embedColor = client.colors.error;
      specialText = " 💥 **CRITICAL FAILURE!** 💥";
    }

    const rollEmbed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle(`🎲 Dice Roll Results${specialText}`)
      .setDescription(`Rolling \`${diceInput}\`...`)
      .addFields(
        {
          name: "🎯 Individual Rolls",
          value: rollDisplay,
          inline: false,
        },
        {
          name: "📊 Calculation",
          value:
            modifier === 0
              ? `${rolls.join(" + ")} = **${total}**`
              : `${rolls.join(" + ")} ${
                  modifier >= 0 ? "+" : ""
                } ${modifier} = **${finalTotal}**`,
          inline: false,
        },
        {
          name: "🏆 Final Result",
          value: `**${finalTotal}**`,
          inline: true,
        },
        {
          name: "📈 Range",
          value: `${minPossible} - ${maxPossible}`,
          inline: true,
        },
        {
          name: "🎲 Dice Info",
          value: `${numDice}d${diceSize}${
            modifier !== 0 ? (modifier > 0 ? "+" + modifier : modifier) : ""
          }`,
          inline: true,
        }
      )
      .setFooter({
        text: `Rolled by ${interaction.user.tag} • ${
          isCriticalSuccess || isCriticalFailure
            ? "What are the odds?"
            : "Good luck!"
        }`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [rollEmbed] });
  },
};
