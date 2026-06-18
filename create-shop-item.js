const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const ShopItem = require('./ShopItem');
const { rarityEmoji } = require('./embed');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('create-shop-item')
    .setDescription('🛒 Create a new shop item')
    .addStringOption(opt => opt.setName('id').setDescription('Unique item ID (no spaces)').setRequired(true))
    .addStringOption(opt => opt.setName('name').setDescription('Item name').setRequired(true))
    .addStringOption(opt => opt.setName('description').setDescription('Item description').setRequired(true))
    .addIntegerOption(opt => opt.setName('price').setDescription('Buy price').setRequired(true).setMinValue(1))
    .addStringOption(opt => opt.setName('category').setDescription('Category').setRequired(true)
      .addChoices({ name: '🚀 Ships', value: 'Ships' }, { name: '🛸 Technology', value: 'Technology' }, { name: '⚡ Boosters', value: 'Boosters' }, { name: '🎨 Cosmetics', value: 'Cosmetics' }, { name: '🧰 Utilities', value: 'Utilities' }, { name: '🎁 Crates', value: 'Crates' }, { name: '👑 Premium', value: 'Premium' }))
    .addStringOption(opt => opt.setName('rarity').setDescription('Rarity').addChoices({ name: 'Common', value: 'Common' }, { name: 'Uncommon', value: 'Uncommon' }, { name: 'Rare', value: 'Rare' }, { name: 'Epic', value: 'Epic' }, { name: 'Legendary', value: 'Legendary' }, { name: 'Mythic', value: 'Mythic' }).setRequired(false))
    .addStringOption(opt => opt.setName('emoji').setDescription('Item emoji').setRequired(false))
    .addIntegerOption(opt => opt.setName('sell-price').setDescription('Sell price (0 = not sellable)').setRequired(false))
    .addBooleanOption(opt => opt.setName('usable').setDescription('Is this item usable?').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  cooldown: 5,
  async execute(interaction) {
    const itemId = interaction.options.getString('id').toLowerCase().replace(/\s+/g, '_');
    const existing = await ShopItem.findOne({ itemId });
    if (existing) return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ ID Already Exists').setDescription(`An item with ID **${itemId}** already exists.`).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    const sellPrice = interaction.options.getInteger('sell-price') ?? 0;
    const item = await ShopItem.create({
      itemId,
      name: interaction.options.getString('name'),
      description: interaction.options.getString('description'),
      price: interaction.options.getInteger('price'),
      sellPrice,
      category: interaction.options.getString('category'),
      rarity: interaction.options.getString('rarity') || 'Common',
      emoji: interaction.options.getString('emoji') || '📦',
      sellable: sellPrice > 0,
      usable: interaction.options.getBoolean('usable') || false,
    });

    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(config.colors.success).setTitle('✅ Shop Item Created!')
        .addFields({ name: '📦 Item', value: `${item.emoji} **${item.name}** ${rarityEmoji(item.rarity)}`, inline: true }, { name: '💰 Price', value: `☄️ ${item.price.toLocaleString()}`, inline: true }, { name: '🆔 ID', value: item.itemId, inline: true })
        .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()],
    });
  },
};