const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("👤 Display detailed information about a user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to get information about")
        .setRequired(false)
    ),
  cooldown: 3,
  async execute(interaction, client) {
    const user = interaction.options.getUser("user") || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);

    // 🎨 Dynamic color based on user's highest role
    const embedColor = member?.roles?.highest?.color || client.colors.primary;

    const userEmbed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle(`👤 User Information`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }))
      .addFields(
        {
          name: "🏷️ Username",
          value: `${user.tag}`,
          inline: true,
        },
        {
          name: "🆔 User ID",
          value: `\`${user.id}\``,
          inline: true,
        },
        {
          name: "🤖 Bot Account",
          value: user.bot ? "✅ Yes" : "❌ No",
          inline: true,
        },
        {
          name: "📅 Account Created",
          value: `<t:${Math.floor(
            user.createdTimestamp / 1000
          )}:F>\n<t:${Math.floor(user.createdTimestamp / 1000)}:R>`,
          inline: false,
        }
      );

    if (member) {
      userEmbed.addFields(
        {
          name: "📥 Joined Server",
          value: `<t:${Math.floor(
            member.joinedTimestamp / 1000
          )}:F>\n<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`,
          inline: false,
        },
        {
          name: "🎭 Nickname",
          value: member.nickname || "None",
          inline: true,
        },
        {
          name: "👑 Highest Role",
          value: member.roles.highest.name,
          inline: true,
        },
        {
          name: "🏆 Role Count",
          value: `${member.roles.cache.size - 1}`,
          inline: true,
        }
      );

      // 🎨 Add boost info if applicable
      if (member.premiumSince) {
        userEmbed.addFields({
          name: "💎 Server Booster",
          value: `Since <t:${Math.floor(
            member.premiumSinceTimestamp / 1000
          )}:R>`,
          inline: true,
        });
      }

      // 📱 Add presence info if available
      if (member.presence) {
        const statusEmojis = {
          online: "🟢",
          idle: "🟡",
          dnd: "🔴",
          offline: "⚫",
        };

        userEmbed.addFields({
          name: "📱 Status",
          value: `${statusEmojis[member.presence.status]} ${
            member.presence.status.charAt(0).toUpperCase() +
            member.presence.status.slice(1)
          }`,
          inline: true,
        });
      }
    }

    userEmbed
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [userEmbed] });
  },
};
