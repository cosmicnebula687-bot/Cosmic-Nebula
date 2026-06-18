const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getUser } = require('./database');
const ShopItem = require('./ShopItem');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add-item')
    .setDescription('📦 Add an item to a user\'s inventory')
    .addUserOption(opt => opt.setName('user').setDescription('User to give item to').setRequired(true))
    .addStringOption(opt => opt.setName('item').setDescription('Item ID').setRequired(true))
    .addIntegerOption(opt => opt.setName('quantity').setDescription('Quantity').setRequired(false).setMinValue(1))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  cooldown: 3,
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const itemId = interaction.options.getString('item').toLowerCase();
    const qty = interaction.options.getInteger('quantity') || 1;

    const shopItem = await ShopItem.findOne({ itemId });
    if (!shopItem) return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Item Not Found').setDescription(`No item with ID **${itemId}** found.`).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    const user = await getUser(target.id);
    const existing = user.inventory.find(i => i.itemId === itemId);
    if (existing) existing.quantity += qty;
    else user.inventory.push({ itemId, name: shopItem.name, emoji: shopItem.emoji, quantity: qty, rarity: shopItem.rarity });
    await user.save();

    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(config.colors.success).setTitle('📦 Item Added')
        .addFields({ name: '👤 User', value: target.tag, inline: true }, { name: '📦 Item', value: `${shopItem.emoji} ${shopItem.name} ×${qty}`, inline: true })
        .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()],
    });
  },
};