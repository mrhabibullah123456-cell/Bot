const { Events, EmbedBuilder, InteractionType } = require("discord.js");
const { GoogleGenAI } = require("@google/genai");
const Database = require("../utils/database");
const { generateContentWithFallback } = require("../utils/gemini");
const {
  sanitizeInput,
  isQuestion,
  parseChannelList,
} = require("../utils/moderation");

// 🤖 Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const history = [];

module.exports = {
  name: Events.MessageCreate,
  async execute(message, client) {
    // 🚫 Ignore bot messages and DMs
    if (message.author.bot || !message.guild) return;

    try {
      const db = await Database.getInstance();
      await db.ensureConnection();

      // 🎯 XP TRACKING LOGIC FIRST
      await handleXPTracking(message, db, client);

      // 🤖 AI ASSISTANT LOGIC
      await handleAIAssistant(message, db, client);
    } catch (error) {
      console.error("❌ Error in messageCreate event:", error);
    }
  },
};

// 🎯 XP Tracking Handler
async function handleXPTracking(message, db, client) {
  try {
    // Get server config
    const config = await db.getServerConfig(message.guild.id);

    // Check if XP is enabled
    if (!config.xpEnabled) return;

    // Check if channel is excluded
    if (config.excludeChannels && config.excludeChannels.includes(message.channel.id)) {
      return;
    }

    // Check if channel is in tracking list (if specified)
    if (config.trackingChannels && config.trackingChannels.length > 0) {
      if (!config.trackingChannels.includes(message.channel.id)) {
        return;
      }
    }

    // Rate limit XP gain (1 XP per minute per user)
    const userId = message.author.id;
    const guildId = message.guild.id;
    const profile = await db.getUserProfile(userId, guildId);

    const now = new Date();
    const lastMessage = profile.lastMessageAt;

    // Check if enough time has passed (60 seconds)
    if (lastMessage && now - lastMessage < 60000) {
      return;
    }

    // Add XP based on configuration
    const xpAmount = config.xpPerMessage || 1;
    const result = await db.addXP(userId, guildId, xpAmount, "message");

    // Update username for leaderboards
    await db.updateUserProfile(userId, guildId, {
      username: message.author.username,
      discriminator: message.author.discriminator,
    });

    // Check for level up
    if (result.levelUp) {
      const levelUpEmbed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle("🎉 Level Up!")
        .setDescription(
          `Congratulations ${message.author}! You've reached **Level ${result.newLevel}**!`
        )
        .addFields({
          name: "📊 Your Stats",
          value: `**Total XP:** ${result.profile.totalXp}\n**Messages:** ${result.profile.messageCount}`,
          inline: true,
        })
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: `Keep chatting to earn more XP!`,
          iconUrl: client.user.displayAvatarURL(),
        })
        .setTimestamp();

      // Send level up message
      try {
        await message.channel.send({ embeds: [levelUpEmbed] });
      } catch (error) {
        console.error("Error sending level up message:", error);
      }
    }

    // Check for role rewards
    if (config.roleAutomation) {
      await checkAndAssignRoles(message.member, db, guildId);
    }
  } catch (error) {
    console.error("Error in XP tracking:", error);
  }
}

// 🎭 Role Assignment Handler
async function checkAndAssignRoles(member, db, guildId) {
  try {
    const roleCheck = await db.checkRoleRewards(member.id, guildId);
    const currentRoleIds = member.roles.cache.map((role) => role.id);

    // Get eligible role IDs
    const eligibleRoleIds = roleCheck.eligibleRoles.map((r) => r.roleId);

    // Roles to add
    const rolesToAdd = eligibleRoleIds.filter(
      (roleId) => !currentRoleIds.includes(roleId) && member.guild.roles.cache.has(roleId)
    );

    // Add new roles
    for (const roleId of rolesToAdd) {
      try {
        const role = member.guild.roles.cache.get(roleId);
        if (role && role.position < member.guild.members.me.roles.highest.position) {
          await member.roles.add(role);
          console.log(`✅ Added role ${role.name} to ${member.user.username}`);
        }
      } catch (error) {
        console.error(`Error adding role ${roleId}:`, error);
      }
    }

    // Update database with current roles
    if (rolesToAdd.length > 0) {
      const newRoles = roleCheck.eligibleRoles.filter((r) =>
        eligibleRoleIds.includes(r.roleId)
      );
      await db.updateUserRoles(member.id, guildId, newRoles);
    }
  } catch (error) {
    console.error("Error checking/assigning roles:", error);
  }
}

// 🤖 AI Assistant Handler
async function handleAIAssistant(message, db, client) {
  try {
    // Check AI assistant auto-listening
    const config = await db.getServerConfig(message.guild.id);

    if (
      !config ||
      !config.aiEnabled ||
      config.aiMode === "disabled" ||
      config.aiMode === "context"
    ) {
      return;
    }

    // 📢 Check if message is in a listening channel
    const listeningChannels = config.aiChannels || [];

    if (!listeningChannels.includes(message.channel.id)) {
      console.log(
        `Is your channel: ${
          message.channel.name
        } exist in the AI Channel list: ${listeningChannels.includes(message.channel.id)}`
      );
      return;
    }

    // 🤔 Check if message looks like a question
    if (!isQuestion(message.content)) {
      return;
    }

    // ⏱️ Rate limiting check
    const rateLimit = await db.checkRateLimit(
      message.author.id,
      message.guild.id,
      5,
      600000
    ); // 3 requests per 10 minutes

    if (!rateLimit.allowed) {
      return; // Silently ignore if rate limited
    }

    // 🧠 Generate AI response
    let systemPrompt = `You are an AI assistant named Vaish in the Discord " ${message.guild.name} ". `;

    if (config.aiContext) {
      systemPrompt += `\n Here's important information about this server: ${config.aiContext} `;
    }

    // 📜 Get recent channel context (last 5 messages)
    const recentMessages = await message.channel.messages.fetch({
      limit: 5,
      before: message.id,
    });
    const channelContext = recentMessages
      .reverse()
      .map((msg) => `${msg.author.username}: ${sanitizeInput(msg.content)}`)
      .join("\n");

    systemPrompt += `\n\nRecent conversation context:\n${channelContext}\n\n`;
    systemPrompt += `Please answer the user's question based on the information provided and recent context. If you don't have enough information, suggest they contact a moderator. Keep responses concise, helpful, and natural. You can reference the conversation context if relevant.`;

    history.push({
      role: "user",
      parts: [
        {
          text: `Question from ${message.author.username}: ${sanitizeInput(
            message.content
          )} `,
        },
      ],
    });

    // 💭 Show typing indicator
    await message.channel.sendTyping();

    const response = await generateContentWithFallback(ai, {
      contents: history,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    history.push({
      role: "model",
      parts: [{ text: response.text }],
    });

    // 📤 Send AI response
    const aiEmbed = new EmbedBuilder()
      .setColor(client.colors.primary)
      .setAuthor({
        name: "AI Assistant",
        iconURL: client.user.displayAvatarURL(),
      })
      .setDescription(response.text.substring(0, 2000))
      .setFooter({
        text: `Responding to ${message.author.username} • Powered by Gemini AI`,
        iconURL: message.author.displayAvatarURL(),
      })
      .setTimestamp();

    if (response.text.length > 2000) {
      aiEmbed.addFields({
        name: "📄 Response Truncated",
        value: "Response was shortened for readability.",
        inline: false,
      });
    }

    await message.reply({ embeds: [aiEmbed] });

    console.log(
      `🤖 AI responded to ${message.author.tag} in ${message.guild.name} #${message.channel.name}`
    );
  } catch (error) {
    console.error("❌ AI auto-response error:", error);
    // Silently fail for auto-responses to avoid spam
  }
}
