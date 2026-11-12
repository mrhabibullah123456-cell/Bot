const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("🖼️ Display a user's avatar in high quality")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user whose avatar you want to view")
        .setRequired(false)
    ),
  cooldown: 3,
  async execute(interaction, client) {
    const user = interaction.options.getUser("user") || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);

    // 🎨 Get avatar URLs in different sizes
    const avatarURL = user.displayAvatarURL({ dynamic: true, size: 4096 });
    const defaultAvatarURL = user.defaultAvatarURL;

    // 🖼️ Server-specific avatar if available
    const guildAvatarURL = member?.avatarURL({ dynamic: true, size: 4096 });

    const avatarEmbed = new EmbedBuilder()
      .setColor(member?.roles?.highest?.color || client.colors.primary)
      .setTitle(`🖼️ ${user.tag}'s Avatar`)
      .setDescription(`High quality avatar for ${user}`)
      .setImage(guildAvatarURL || avatarURL)
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    // 🔗 Add download links
    const links = [`[Download (4096px)](${avatarURL})`];

    if (guildAvatarURL && guildAvatarURL !== avatarURL) {
      links.push(`[Server Avatar (4096px)](${guildAvatarURL})`);
    }

    links.push(`[Default Avatar](${defaultAvatarURL})`);

    avatarEmbed.addFields({
      name: "🔗 Download Links",
      value: links.join(" • "),
      inline: false,
    });

    await interaction.reply({ embeds: [avatarEmbed] });
  },
};
