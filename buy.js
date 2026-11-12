const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const Database = require("../../utils/database");
const {
  COMMAND_ACCESS_DURATION_MS,
  COMMAND_ACCESS_ITEM_NAME,
  COMMAND_ACCESS_PRICE,
} = require("../../utils/commandAccess");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("buy")
    .setDescription("🛒 Buy a shop item or temporary command access.")
    .addStringOption(option =>
      option.setName("item")
        .setDescription("The shop item name, or Command Access (30 days).")
        .setRequired(true)),
  async execute(interaction) {
    const db = await Database.getInstance();
    await db.ensureConnection();
    const itemName = interaction.options.getString("item").trim();

    if (itemName.toLowerCase() === COMMAND_ACCESS_ITEM_NAME.toLowerCase()) {
      const guildId = interaction.guild.id;
      const userId = interaction.user.id;

      await db.getUserProfile(userId, guildId);
      const now = new Date();
      const purchasedProfile = await db.UserProfile.findOneAndUpdate(
        { userId, guildId, wallet: { $gte: COMMAND_ACCESS_PRICE } },
        [
          {
            $set: {
              wallet: { $subtract: ["$wallet", COMMAND_ACCESS_PRICE] },
              commandAccessExpiresAt: {
                $add: [
                  {
                    $max: [
                      { $ifNull: ["$commandAccessExpiresAt", new Date(0)] },
                      now,
                    ],
                  },
                  COMMAND_ACCESS_DURATION_MS,
                ],
              },
            },
          },
        ],
        { new: true },
      );

      if (!purchasedProfile) {
        const latestProfile = await db.UserProfile.findOne({ userId, guildId }).select("wallet");
        const wallet = latestProfile?.wallet || 0;
        return interaction.reply({
          content:
            `❌ You need **${COMMAND_ACCESS_PRICE.toLocaleString()}** coins to buy command access, ` +
            `but you have **${wallet.toLocaleString()}**. Earn coins with \`/work\` or ask a server admin to add coins with \`/add-coins\`.`,
          flags: [MessageFlags.Ephemeral],
        });
      }

      const expirationTimestamp = Math.floor(
        purchasedProfile.commandAccessExpiresAt.getTime() / 1000,
      );
      return interaction.reply({
        content:
          `✅ Command access unlocked until <t:${expirationTimestamp}:F>! ` +
          `Your access has been extended by ${COMMAND_ACCESS_DURATION_MS / (24 * 60 * 60 * 1000)} days.`,
        flags: [MessageFlags.Ephemeral],
      });
    }

    const item = await db.ShopItem.findOne({ guildId: interaction.guild.id, name: itemName });
    if (!item) {
      return await interaction.reply({ content: "❌ That item does not exist in the shop.", flags: [MessageFlags.Ephemeral] });
    }

    const profile = await db.getUserProfile(interaction.user.id, interaction.guild.id);
    if (profile.wallet < item.price) {
      return await interaction.reply({ content: `❌ You don't have enough coins. You need **${item.price.toLocaleString()}** coins to buy this.`, flags: [MessageFlags.Ephemeral] });
    }
    
    const member = interaction.member;
    if (member.roles.cache.has(item.roleId)) {
        return await interaction.reply({ content: "❌ You already own this role!", flags: [MessageFlags.Ephemeral] });
    }

    try {
        // Perform transaction
        profile.wallet -= item.price;
        profile.inventory.push(item.roleId);
        await profile.save();

        await member.roles.add(item.roleId, "Purchased from shop");

        await interaction.reply({ content: `✅ Congratulations! You have purchased the **${item.name}** role.` });
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: "❌ There was an error while trying to give you the role. Please contact an admin.", flags: [MessageFlags.Ephemeral] });
    }
  },
};