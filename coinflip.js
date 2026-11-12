const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} = require("discord.js");
const Database = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("Challenge another player to a coin-flip bet.")
    .addUserOption(option =>
      option.setName("opponent")
        .setDescription("The player you want to challenge.")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("bet")
        .setDescription("The amount of coins each player will bet.")
        .setRequired(true)
        .setMinValue(1)
    )
    .addStringOption(option =>
      option.setName("choice")
        .setDescription("Your choice: Heads or Tails.")
        .setRequired(true)
        .addChoices(
          { name: "Heads", value: "heads" },
          { name: "Tails", value: "tails" }
        )
    ),

  async execute(interaction) {
    if (!interaction.inGuild()) {
      return interaction.reply({
        content: "This command can only be used in a server.",
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const opponent = interaction.options.getUser("opponent");
    const betAmount = interaction.options.getInteger("bet");
    const userChoice = interaction.options.getString("choice");

    if (!opponent || betAmount === null || userChoice === null) {
      return interaction.editReply(
        "The coinflip command options are outdated or incomplete. Please ask a bot administrator to run `npm run deploy`, then try again."
      );
    }

    if (opponent.bot) {
      return interaction.editReply("You cannot challenge a bot.");
    }
    if (opponent.id === interaction.user.id) {
      return interaction.editReply("You cannot challenge yourself.");
    }

    const db = await Database.getInstance();
    await db.ensureConnection();

    const [challengerProfile, opponentProfile] = await Promise.all([
      db.getUserProfile(interaction.user.id, interaction.guild.id),
      db.getUserProfile(opponent.id, interaction.guild.id),
    ]);

    if (challengerProfile.wallet < betAmount) {
      return interaction.editReply(
        `You do not have enough coins. Your wallet has **${challengerProfile.wallet.toLocaleString()}** coins.`
      );
    }
    if (opponentProfile.wallet < betAmount) {
      return interaction.editReply(
        `${opponent} does not have enough coins to match this bet.`
      );
    }

    const challengeEmbed = new EmbedBuilder()
      .setColor("#3498DB")
      .setTitle("🪙 Coin Flip Challenge")
      .setDescription(
        `${opponent}, **${interaction.user.username}** challenges you to bet **${betAmount.toLocaleString()}** coins.\n` +
        `They chose **${userChoice}**. Choose heads or tails within 60 seconds.`
      );
    const choiceRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("coinflip_heads")
        .setLabel("Heads")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("coinflip_tails")
        .setLabel("Tails")
        .setStyle(ButtonStyle.Secondary)
    );

    const challengeMessage = await interaction.channel.send({
      embeds: [challengeEmbed],
      components: [choiceRow],
    });
    await interaction.editReply(
      `Your coin-flip challenge was posted for ${opponent}.`
    );
    const updateChallengeMessage = async payload => {
      try {
        return await challengeMessage.edit(payload);
      } catch (error) {
        if (error.code !== 10008) throw error;
        return interaction.channel.send({
          embeds: payload.embeds,
          components: payload.components || [],
        });
      }
    };

    const collector = challengeMessage.createMessageComponentCollector({
      time: 60_000,
    });

    const opponentChoice = await new Promise(resolve => {
      let choiceLocked = false;

      collector.on("collect", async buttonInteraction => {
        if (buttonInteraction.user.id !== opponent.id) {
          return buttonInteraction.reply({
            content: `Only ${opponent} can choose for this challenge.`,
            flags: MessageFlags.Ephemeral,
          });
        }

        if (choiceLocked) return;
        choiceLocked = true;
        const choice = buttonInteraction.customId === "coinflip_heads"
          ? "heads"
          : "tails";

        await buttonInteraction.deferUpdate();
        resolve(choice);
        collector.stop("selected");
      });

      collector.on("end", (_collected, reason) => {
        if (reason !== "selected") resolve(null);
      });
    });

    if (!opponentChoice) {
      challengeEmbed
        .setColor("#95A5A6")
        .setTitle("Coin Flip Challenge Expired")
        .setDescription(`${opponent} did not choose in time. No coins were transferred.`);
      return updateChallengeMessage({
        embeds: [challengeEmbed],
        components: [],
      });
    }

    const [currentChallengerProfile, currentOpponentProfile] = await Promise.all([
      db.getUserProfile(interaction.user.id, interaction.guild.id),
      db.getUserProfile(opponent.id, interaction.guild.id),
    ]);

    if (
      currentChallengerProfile.wallet < betAmount ||
      currentOpponentProfile.wallet < betAmount
    ) {
      challengeEmbed
        .setColor("#95A5A6")
        .setTitle("Coin Flip Challenge Cancelled")
        .setDescription("A player's wallet no longer has enough coins to cover the bet. No coins were transferred.");
      return updateChallengeMessage({
        embeds: [challengeEmbed],
        components: [],
      });
    }

    const result = Math.random() < 0.5 ? "heads" : "tails";
    const finalEmbed = new EmbedBuilder()
      .setTitle("🪙 Coin Flip Result")
      .setDescription(
        `**${interaction.user.username}** chose **${userChoice}**.\n` +
        `**${opponent.username}** chose **${opponentChoice}**.\n` +
        `The coin landed on **${result}**.`
      );

    if (userChoice === opponentChoice) {
      finalEmbed
        .setColor("#F1C40F")
        .addFields({
          name: "Draw",
          value: result === userChoice
            ? "Both players guessed correctly. The pot is split evenly, so each player keeps their original stake."
            : "There is no winner because both chose the same side. Both original stakes are returned.",
        });
    } else {
      const winnerIsChallenger = result === userChoice;
      const winnerProfile = winnerIsChallenger
        ? currentChallengerProfile
        : currentOpponentProfile;
      const loserProfile = winnerIsChallenger
        ? currentOpponentProfile
        : currentChallengerProfile;
      const winner = winnerIsChallenger ? interaction.user : opponent;
      const loser = winnerIsChallenger ? opponent : interaction.user;

      loserProfile.wallet -= betAmount;
      winnerProfile.wallet += betAmount;
      await Promise.all([
        currentChallengerProfile.save(),
        currentOpponentProfile.save(),
      ]);

      finalEmbed
        .setColor("#2ECC71")
        .addFields({
          name: "Winner",
          value: `${winner} won **${betAmount.toLocaleString()}** coins from ${loser}.`,
        });
    }

    return updateChallengeMessage({
      embeds: [finalEmbed],
      components: [],
    });
  },
};
