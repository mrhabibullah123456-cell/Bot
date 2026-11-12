const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("poll")
    .setDescription("📊 Create interactive polls with emoji reactions")
    .addStringOption((option) =>
      option
        .setName("question")
        .setDescription("The poll question")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("options")
        .setDescription(
          "Poll options separated by commas (e.g., Pizza, Burgers, Tacos)"
        )
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("duration")
        .setDescription("Poll duration in minutes (default: 60, max: 1440)")
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(1440)
    ),
  cooldown: 10,
  async execute(interaction, client) {
    const question = interaction.options.getString("question");
    const optionsString = interaction.options.getString("options");
    const duration = interaction.options.getInteger("duration") || 60;

    // 📝 Parse options with better validation
    const rawOptions = optionsString
      .split(",")
      .map((option) => option.trim())
      .filter((option) => option.length > 0);

    // Remove duplicates and limit length
    const options = [...new Set(rawOptions)].slice(0, 10);

    if (options.length < 2) {
      return interaction.reply({
        flags: 32768, // IS_COMPONENTS_V2 flag
        components: [
          {
            type: 17, // Container
            accent_color: 0xff0000, // Red
            components: [
              {
                type: 10, // Text Display
                content: "# ❌ Invalid Poll Options",
              },
              {
                type: 14, // Separator
                divider: true,
                spacing: 1,
              },
              {
                type: 10, // Text Display
                content:
                  "**Requirements:**\n• At least 2 options needed\n• Separate options with commas\n• Maximum 10 options allowed",
              },
              {
                type: 14, // Separator
                divider: false,
                spacing: 1,
              },
              {
                type: 9, // Section
                components: [
                  {
                    type: 10,
                    content:
                      "**Examples:**\n• `Pizza, Burgers, Tacos`\n• `Yes, No, Maybe`\n• `Movie A, Movie B, Movie C, Other`",
                  },
                ],
                accessory: {
                  type: 11, // Thumbnail
                  media: {
                    url: interaction.user.displayAvatarURL(),
                  },
                },
              },
            ],
          },
        ],
      });
    }

    if (options.length > 10) {
      return interaction.reply({
        flags: 32768, // IS_COMPONENTS_V2 flag
        components: [
          {
            type: 17, // Container
            accent_color: 0xffa500, // Orange
            components: [
              {
                type: 10, // Text Display
                content:
                  "# ⚠️ Too Many Options\nMaximum 10 options allowed per poll for better readability.",
              },
              {
                type: 10, // Text Display
                content: `-# Your input had ${options.length} options. Please reduce to 10 or fewer.`,
              },
            ],
          },
        ],
      });
    }

    // 🎨 Number emojis for reactions
    const numberEmojis = [
      "1️⃣",
      "2️⃣",
      "3️⃣",
      "4️⃣",
      "5️⃣",
      "6️⃣",
      "7️⃣",
      "8️⃣",
      "9️⃣",
      "🔟",
    ];

    // 📊 Create modern poll using new components
    const endTime = new Date(Date.now() + duration * 60 * 1000);

    const pollMessage = await interaction.reply({
      flags: 32768, // IS_COMPONENTS_V2 flag
      components: [
        {
          type: 17, // Container
          accent_color: 0x0099ff, // Blue
          components: [
            {
              type: 10, // Text Display
              content: `# 📊 ${question}`,
            },
            {
              type: 14, // Separator
              divider: true,
              spacing: 1,
            },
            {
              type: 10, // Text Display
              content: options
                .map((option, index) => `${numberEmojis[index]} **${option}**`)
                .join("\n"),
            },
            {
              type: 14, // Separator
              divider: false,
              spacing: 1,
            },
            {
              type: 9, // Section
              components: [
                {
                  type: 10,
                  content: `**⏱️ Duration:** ${duration} minute${
                    duration === 1 ? "" : "s"
                  }\n**📅 Ends:** <t:${Math.floor(
                    endTime.getTime() / 1000
                  )}:R>\n**👤 Created by:** ${interaction.user.tag}`,
                },
              ],
              accessory: {
                type: 11, // Thumbnail
                media: {
                  url: interaction.user.displayAvatarURL(),
                },
              },
            },
            {
              type: 10, // Text Display
              content: "-# React with the corresponding emoji to vote!",
            },
          ],
        },
      ],
    });

    // Get the message for adding reactions
    const message = await interaction.fetchReply();

    // 🎯 Add reactions
    try {
      for (let i = 0; i < options.length; i++) {
        await message.react(numberEmojis[i]);
      }
    } catch (error) {
      console.error("❌ Error adding reactions:", error);
    }

    // ⏰ Set timer to close poll
    setTimeout(async () => {
      try {
        // 🔍 Fetch updated message to get reaction counts
        const updatedMessage = await message.fetch();
        const reactions = updatedMessage.reactions.cache;

        // 📊 Calculate results
        const results = options.map((option, index) => {
          const reaction = reactions.get(numberEmojis[index]);
          const count = reaction ? reaction.count - 1 : 0; // Subtract bot's reaction
          return { option, count, emoji: numberEmojis[index] };
        });

        // 🏆 Find winner(s)
        const maxVotes = Math.max(...results.map((r) => r.count));
        const winners = results.filter((r) => r.count === maxVotes);
        const totalVotes = results.reduce((sum, r) => sum + r.count, 0);

        // 🎨 Create results embed
        const resultsEmbed = new EmbedBuilder()
          .setColor(client.colors.success)
          .setTitle("📊 Poll Results")
          .setDescription(
            `**${question}**\n\n${results
              .map(
                (r) =>
                  `${r.emoji} **${r.option}** - ${r.count} vote${
                    r.count === 1 ? "" : "s"
                  } ${r.count === maxVotes && maxVotes > 0 ? "🏆" : ""}`
              )
              .join("\n")}`
          )
          .addFields(
            {
              name: "📈 Total Votes",
              value: `${totalVotes}`,
              inline: true,
            },
            {
              name: "🏆 Winner",
              value:
                maxVotes === 0
                  ? "No votes cast"
                  : winners.length === 1
                  ? winners[0].option
                  : `Tie: ${winners.map((w) => w.option).join(", ")}`,
              inline: true,
            },
            {
              name: "⏰ Status",
              value: "🔒 Closed",
              inline: true,
            }
          )
          .setFooter({
            text: `Poll created by ${interaction.user.tag} • Voting is now closed`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setTimestamp();

        await updatedMessage.edit({ embeds: [resultsEmbed] });
        console.log(
          `📊 Poll "${question}" closed with ${totalVotes} total votes`
        );
      } catch (error) {
        console.error("❌ Error closing poll:", error);
      }
    }, duration * 60000);

    console.log(
      `📊 Poll created: "${question}" with ${options.length} options, duration: ${duration} minutes`
    );
  },
};
