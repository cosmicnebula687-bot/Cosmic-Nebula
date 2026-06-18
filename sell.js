const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('./database');
const ShopItem = require('./ShopItem');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sell')
    .setDescription('💱 Sell an item from your inventory')
    .addStringOption(opt => opt.setName('item').setDescription('Item name to sell').setRequired(true))
    .addIntegerOption(opt => opt.setName('quantity').setDescription('Quantity to sell').setRequired(false).setMinValue(1)),
  cooldown: 3,
  async execute(interaction) {
    const itemInput = interaction.options.getString('item').toLowerCase();
    const qty = interaction.options.getInteger('quantity') || 1;
    const user = await getUser(interaction.user.id);

    const invItem = user.inventory.find(i => i.name.toLowerCase().includes(itemInput) || i.itemId === itemInput);
    if (!invItem)
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Item Not Found').setDescription(`You don't have **${itemInput}** in your inventory.`).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    if (invItem.quantity < qty)
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Not Enough').setDescription(`You only have **${invItem.quantity}×** ${invItem.name}.`).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    const shopItem = await ShopItem.findOne({ itemId: invItem.itemId });
    if (!shopItem || !shopItem.sellable || shopItem.sellPrice <= 0)
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Not Sellable').setDescription(`**${invItem.name}** cannot be sold back to the shop.`).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    const totalEarned = shopItem.sellPrice * qty;
    invItem.quantity -= qty;
    if (invItem.quantity <= 0) user.inventory = user.inventory.filter(i => i.itemId !== invItem.itemId);
    user.wallet += totalEarned;
    await user.save();

    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(config.colors.success).setTitle('💱 Item Sold!')
        .setDescription(`Sold **${qty}×** ${invItem.emoji} **${invItem.name}**`)
        .addFields({ name: '💰 Earned', value: `☄️ **${totalEarned.toLocaleString()}** Credits`, inline: true }, { name: '👛 New Balance', value: `☄️ **${user.wallet.toLocaleString()}** Credits`, inline: true })
        .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()],
    });
  },
};