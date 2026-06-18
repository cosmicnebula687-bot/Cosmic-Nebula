const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('./database');
const ShopItem = require('./ShopItem');
const { rarityEmoji, rarityColor } = require('./embed');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('buy')
    .setDescription('🛒 Purchase an item from the Galactic Shop')
    .addStringOption(opt => opt.setName('item').setDescription('Item ID or name to buy').setRequired(true))
    .addIntegerOption(opt => opt.setName('quantity').setDescription('Quantity to buy').setRequired(false).setMinValue(1).setMaxValue(100)),
  cooldown: 3,
  async execute(interaction) {
    const itemInput = interaction.options.getString('item').toLowerCase();
    const qty = interaction.options.getInteger('quantity') || 1;
    const user = await getUser(interaction.user.id);

    const item = await ShopItem.findOne({
      $or: [{ itemId: itemInput }, { name: { $regex: itemInput, $options: 'i' } }],
      enabled: true, buyable: true,
    });

    if (!item)
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Item Not Found').setDescription(`No buyable item found matching **${itemInput}**.\nUse **/shop** to browse available items.`).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    const totalCost = item.price * qty;
    if (user.wallet < totalCost)
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Insufficient Credits').setDescription(`This costs ☄️ **${totalCost.toLocaleString()}** Credits.\nYou have ☄️ **${user.wallet.toLocaleString()}** Credits.`).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    user.wallet -= totalCost;
    const existing = user.inventory.find(i => i.itemId === item.itemId);
    if (existing) existing.quantity += qty;
    else user.inventory.push({ itemId: item.itemId, name: item.name, emoji: item.emoji, quantity: qty, rarity: item.rarity });
    await user.save();

    const embed = new EmbedBuilder()
      .setColor(rarityColor(item.rarity))
      .setTitle(`✅ Purchase Successful!`)
      .setDescription(`You acquired **${item.emoji} ${item.name}** from the Galactic Shop!`)
      .addFields(
        { name: '🛒 Item', value: `${item.emoji} ${item.name} ${rarityEmoji(item.rarity)}`, inline: true },
        { name: '💰 Paid', value: `☄️ **${totalCost.toLocaleString()}** Credits`, inline: true },
        { name: '📦 Quantity', value: `×**${qty}**`, inline: true },
        { name: '👛 Remaining', value: `☄️ **${user.wallet.toLocaleString()}** Credits`, inline: true },
      )
      .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};