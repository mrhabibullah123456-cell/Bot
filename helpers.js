const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

// 🎮 Help menu navigation handler
async function handleHelpNavigation(interaction, client) {
  const category = interaction.customId.split("_")[1];

  const helpEmbeds = {
    utility: new EmbedBuilder()
      .setColor(client.colors.primary)
      .setTitle("🔧 Utility Commands")
      .setDescription("Essential tools and information commands")
      .addFields(
        {
          name: "`/userinfo [user]`",
          value: "Display detailed user information",
          inline: false,
        },
        {
          name: "`/serverinfo`",
          value: "Show server statistics and details",
          inline: false,
        },
        {
          name: "`/ping`",
          value: "Check bot latency and response time",
          inline: false,
        },
        {
          name: "`/botstats`",
          value: "View bot performance statistics",
          inline: false,
        },
        {
          name: "`/avatar [user]`",
          value: "Display user avatar in high quality",
          inline: false,
        }
      )
      .setTimestamp(),

    fun: new EmbedBuilder()
      .setColor(client.colors.success)
      .setTitle("🎉 Fun Commands")
      .setDescription("Entertainment and interactive commands")
      .addFields(
        {
          name: "`/8ball <question>`",
          value: "Ask the magic 8-ball a question",
          inline: false,
        },
        {
          name: "`/meme`",
          value: "Get a random meme to brighten your day",
          inline: false,
        },
        {
          name: "`/roll <dice>`",
          value: "Roll dice (1d6, 2d20, etc.)",
          inline: false,
        },
        {
          name: "`/flipcoin`",
          value: "Flip a coin and see heads or tails",
          inline: false,
        },
        {
          name: "`/dadjoke`",
          value: "Tell a random silly dad joke",
          inline: false,
        },
        {
          name: "`/wouldyourather`",
          value: "Get a fun 'would you rather' question",
          inline: false,
        },
        {
          name: "`/poll <question> <options>`",
          value: "Create interactive polls with reactions",
          inline: false,
        },
        {
          name: "`/reminder <time> <message>`",
          value: "Set personal reminders",
          inline: false,
        },
        {
          name: "`/secret`",
          value: "🤫 Hidden easter egg command",
          inline: false,
        }
      )
      .setTimestamp(),

    moderation: new EmbedBuilder()
      .setColor(client.colors.warning)
      .setTitle("🔒 Moderation Commands")
      .setDescription("Server management and moderation tools")
      .addFields(
        {
          name: "`/kick @user [reason]`",
          value: "Kick a user from the server",
          inline: false,
        },
        {
          name: "`/ban @user [reason]`",
          value: "Ban a user from the server",
          inline: false,
        },
        {
          name: "`/purge <amount>`",
          value: "Bulk delete messages (up to 100)",
          inline: false,
        }
      )
      .setFooter({ text: "⚠️ Requires appropriate permissions" })
      .setTimestamp(),

    interactive: new EmbedBuilder()
      .setColor(client.colors.dark)
      .setTitle("✨ Interactive Commands")
      .setDescription("Modern Discord features and interactions")
      .addFields(
        {
          name: "`/feedback`",
          value: "Submit feedback using select menus",
          inline: false,
        },
        {
          name: "`/help`",
          value: "Navigate commands with interactive buttons",
          inline: false,
        }
      )
      .setTimestamp(),
  };

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("help_utility")
      .setLabel("🔧 Utility")
      .setStyle(
        category === "utility" ? ButtonStyle.Primary : ButtonStyle.Secondary
      ),
    new ButtonBuilder()
      .setCustomId("help_fun")
      .setLabel("🎉 Fun")
      .setStyle(
        category === "fun" ? ButtonStyle.Primary : ButtonStyle.Secondary
      ),
    new ButtonBuilder()
      .setCustomId("help_moderation")
      .setLabel("🔒 Moderation")
      .setStyle(
        category === "moderation" ? ButtonStyle.Primary : ButtonStyle.Secondary
      ),
    new ButtonBuilder()
      .setCustomId("help_interactive")
      .setLabel("✨ Interactive")
      .setStyle(
        category === "interactive" ? ButtonStyle.Primary : ButtonStyle.Secondary
      )
  );

  await interaction.update({
    embeds: [helpEmbeds[category]],
    components: [row],
  });
}

// 📋 Feedback selection handler
async function handleFeedbackSelection(interaction, client) {
  const selectedType = interaction.values[0];

  const feedbackResponses = {
    bug: {
      title: "🐛 Bug Report Received",
      description:
        "Thank you for reporting a bug! Our team will investigate this issue.",
      color: client.colors.error,
    },
    feature: {
      title: "💡 Feature Request Received",
      description:
        "Great suggestion! We'll consider this feature for future updates.",
      color: client.colors.success,
    },
    general: {
      title: "💬 General Feedback Received",
      description: "Thanks for your feedback! Your input helps us improve.",
      color: client.colors.primary,
    },
    compliment: {
      title: "🌟 Thank You!",
      description:
        "We really appreciate your kind words! It motivates us to keep improving.",
      color: client.colors.warning,
    },
  };

  const response = feedbackResponses[selectedType];

  const responseEmbed = new EmbedBuilder()
    .setColor(response.color)
    .setTitle(response.title)
    .setDescription(response.description)
    .setFooter({
      text: `Feedback from ${interaction.user.tag}`,
      iconURL: interaction.user.displayAvatarURL(),
    })
    .setTimestamp();

  await interaction.update({
    embeds: [responseEmbed],
    components: [],
  });
}

// 🎲 Random response generator
function getRandomResponse(responses) {
  return responses[Math.floor(Math.random() * responses.length)];
}

// ⏱️ Format uptime
function formatUptime(uptimeMs) {
  const days = Math.floor(uptimeMs / (24 * 60 * 60 * 1000));
  const hours = Math.floor(
    (uptimeMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
  );
  const minutes = Math.floor((uptimeMs % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((uptimeMs % (60 * 1000)) / 1000);

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

// 📊 Format bytes
function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// 🎨 Progress bar generator
function generateProgressBar(current, total, length = 10) {
  const progress = Math.round((current / total) * length);
  const emptyProgress = length - progress;

  const progressText = "▰".repeat(progress);
  const emptyProgressText = "▱".repeat(emptyProgress);

  return progressText + emptyProgressText;
}

module.exports = {
  handleHelpNavigation,
  handleFeedbackSelection,
  getRandomResponse,
  formatUptime,
  formatBytes,
  generateProgressBar,
};
