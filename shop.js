const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Database = require("../../utils/database");
const {
  COMMAND_ACCESS_DURATION_MS,
  COMMAND_ACCESS_ITEM_NAME,
  COMMAND_ACCESS_PRICE,
} = require("../../utils/commandAccess");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription("🛍️ Displays items and command access available for purchase."),
  async execute(interaction) {
    const db = await Database.getInstance();
    await db.ensureConnection();
    const items = await db.ShopItem.find({ guildId: interaction.guild.id }).sort({ price: 1 });

    const shopEmbed = new EmbedBuilder()
      .setColor("#9B59B6")
      .setTitle(`${interaction.guild.name}'s Shop`)
      .setDescription("Use `/buy` with an item name to make a purchase.");

    let itemsDescription = "";
    items.forEach(item => {
      let details = `Price: **${item.price.toLocaleString()}** coins`;
      if (item.itemType === 'income') {
        const cooldownHours = item.incomeCooldown / 3600;
        details += ` | Income: **+${item.incomeAmount}** every **${cooldownHours}h**`;
      }
      itemsDescription += `**${item.name}** - <@&${item.roleId}>\n${details}\n\n`;
    });

    if (itemsDescription) {
      shopEmbed.addFields({ name: "Available Roles", value: itemsDescription });
    } else {
      shopEmbed.addFields({
        name: "Available Roles",
        value: "There are no role items available right now.",
      });
    }

    shopEmbed.addFields({
      name: "Bot Command Access",
      value:
        `**${COMMAND_ACCESS_ITEM_NAME}**\n` +
        `Unlock regular bot commands for ${COMMAND_ACCESS_DURATION_MS / (24 * 60 * 60 * 1000)} days.\n` +
        `Price: **${COMMAND_ACCESS_PRICE.toLocaleString()}** coins\n` +
        `Use \`/buy item:${COMMAND_ACCESS_ITEM_NAME}\` to purchase.`,
    });
    
    await interaction.reply({ embeds: [shopEmbed] });
  },
};