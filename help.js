const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("📚 Get help with bot commands and features"),
  cooldown: 3,

  async execute(interaction, client) {
    // 🎨 Create main help embed
    const mainEmbed = new EmbedBuilder()
      .setColor(client.colors.primary)
      .setTitle("🤖 Nova Bot - Command Center")
      .setDescription(
        "**Welcome to Nova Bot!** 🚀\n\n" +
        "I'm your all-in-one Discord companion with tons of features:\n" +
        "• 🎮 **Fun Commands** - Games, memes, and entertainment\n" +
        "• 🛡️ **Moderation** - Keep your server safe and organized\n" +
        "• 🤖 **AI Assistant** - Smart AI-powered help and conversation\n" +
        "• ⚙️ **General** - Utility commands and server management\n" +
        "• 🎯 **XP System** - Level up and earn rewards!\n\n" +
        "Select a category below to explore commands!"
      )
      .addFields(
        {
          name: "🌟 Quick Start",
          value: "Use `/profile` to see your stats and `/xpconfig` to set up rewards!",
          inline: false,
        },
        {
          name: "📊 Stats",
          value: `🏠 Servers: ${client.guilds.cache.size}\n👥 Users: ${client.users.cache.size}\n⚡ Commands: ${client.commands.size}`,
          inline: true,
        },
        {
          name: "🔗 Links",
          value: "[Support](https://discord.gg/support) • [GitHub](https://github.com/nova-bot)",
          inline: true,
        }
      )
      .setThumbnail(client.user.displayAvatarURL())
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    // 🎮 Create category buttons
    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("help_fun")
        .setLabel("🎮 Fun")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("help_moderation")
        .setLabel("🛡️ Moderation")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("help_ai")
        .setLabel("🤖 AI Assistant")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("help_general")
        .setLabel("⚙️ General")
        .setStyle(ButtonStyle.Secondary)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("help_xp")
        .setLabel("🎯 XP System")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("help_refresh")
        .setLabel("🔄 Refresh")
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({
      embeds: [mainEmbed],
      components: [row1, row2],
      flags: 64, // MessageFlags.Ephemeral
    });
  },

  // 📋 Category command lists
  getCommands: {
    fun: {
      title: "🎮 Fun Commands",
      description: "Entertainment and games to spice up your server!",
      color: "#FF6B6B",
      commands: [
        "`/8ball <question>` - Ask the magic 8-ball",
        "`/meme` - Get a random meme",
        "`/roll <sides>` - Roll a dice",
        "`/poll <question> <options>` - Create a poll",
        "`/avatar [user]` - Show user's avatar",
        "`/reminder <time> <message>` - Set a reminder"
      ]
    },
    moderation: {
      title: "🛡️ Moderation Commands",
      description: "Keep your server safe and organized",
      color: "#FF4757",
      commands: [
        "`/kick <user> [reason]` - Kick a member",
        "`/ban <user> [reason]` - Ban a member",
        "`/purge <amount>` - Delete multiple messages",
        "`/ticket` - Create a support ticket",
        "`/ticketdashboard` - Manage ticket system"
      ]
    },
    ai: {
      title: "🤖 AI Assistant",
      description: "Smart AI-powered features and conversation",
      color: "#00BFFF",
      commands: [
        "`/aiassistant setup` - Configure AI assistant",
        "`/aiassistant mode <type>` - Set AI mode",
        "`/aiassistant context` - Upload context files",
        "`/aiassistant status` - Check AI configuration",
        "`/aiassistant ask <question>` - Ask the AI"
      ]
    },
    general: {
      title: "⚙️ General Commands",
      description: "Utility and information commands",
      color: "#FFA726",
      commands: [
        "`/ping` - Check bot latency",
        "`/userinfo [user]` - Get user information",
        "`/serverinfo` - Get server information",
        "`/botstats` - Show bot statistics",
        "`/feedback` - Send feedback to developers"
      ]
    },
    xp: {
      title: "🎯 XP System",
      description: "Level up, earn rewards, and track progress!",
      color: "#A8E6CF",
      commands: [
        "`/profile [user]` - View user profile and stats",
        "`/roles` - Manage role rewards",
        "`/xpconfig` - Configure XP system",
        "`/leaderboard` - View server leaderboard"
      ]
    }
  }
};
