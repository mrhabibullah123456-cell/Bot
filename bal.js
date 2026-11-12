const {
	SlashCommandBuilder,
	EmbedBuilder,
	MessageFlags,
	PermissionFlagsBits,
} = require("discord.js");
const Database = require("../../utils/database");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("bal")
		.setDescription("💰 Check your wallet and bank balance")
		.addUserOption((option) =>
			option
				.setName("user")
				.setDescription("The user to check the balance of (optional)")
				.setRequired(false),
		),
	async execute(interaction) {
		if (!interaction.inGuild()) {
			return interaction.reply({
				content: "This command can only be used in a server.",
				flags: MessageFlags.Ephemeral,
			});
		}

		const targetUser = interaction.options.getUser("user") || interaction.user;
		const isAdmin = interaction.memberPermissions?.has(
			PermissionFlagsBits.Administrator,
		);
		if (targetUser.id !== interaction.user.id && !isAdmin) {
			return interaction.reply({
				content: "You can only check your own balance. Only admins can check another member's balance.",
				flags: MessageFlags.Ephemeral,
			});
		}

		const db = await Database.getInstance();
		await db.ensureConnection();
		const guildId = interaction.guild.id;

		await interaction.deferReply();

		const profile = await db.getUserProfile(targetUser.id, guildId);

		if (!profile) {
			return await interaction.editReply({
				content: `❌ No profile data found for ${targetUser.username}.`,
			});
		}

		const balanceEmbed = new EmbedBuilder()
			.setColor("#FFD700") // Gold color for economy!
			.setTitle(`💰 ${targetUser.username}'s Balance`)
			.setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
			.addFields(
				{
					name: "👛 Wallet",
					value: `**${(profile.wallet || 0).toLocaleString()}** coins`,
					inline: true,
				},
				{
					name: "🏦 Bank",
					value: `**${(profile.bank || 0).toLocaleString()}** coins`,
					inline: true,
				},
				{
					name: "📊 Total",
					value: `**${(
						(profile.wallet || 0) + (profile.bank || 0)
					).toLocaleString()}** coins`,
					inline: true,
				},
			)
			.setFooter({
				text: `Requested by ${interaction.user.tag}`,
				iconURL: interaction.user.displayAvatarURL(),
			})
			.setTimestamp();

		await interaction.editReply({ embeds: [balanceEmbed] });
	},
};
