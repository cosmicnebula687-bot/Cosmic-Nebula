const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('./database');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gift')
    .setDescription('🎁 Gift an item from your inventory to another traveler')
    .addUserOption(opt => opt.setName('user').setDescription('User to gift').setRequired(true))
    .addStringOption(opt => opt.setName('item').setDescription('Item name to gift').setRequired(true))
    .addIntegerOption(opt => opt.setName('quantity').setDescription('Quantity').setRequired(false).setMinValue(1)),
  cooldown: 5,
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const itemInput = interaction.options.getString('item').toLowerCase();
    const qty = interaction.options.getInteger('quantity') || 1;

    if (target.id === interaction.user.id || target.bot)
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Invalid Target').setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    const sender = await getUser(interaction.user.id);
    const invItem = sender.inventory.find(i => i.name.toLowerCase().includes(itemInput) || i.itemId === itemInput);
    if (!invItem || invItem.quantity < qty)
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Item Not Available').setDescription(`You don't have enough **${itemInput}** to gift.`).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    const receiver = await getUser(target.id);
    invItem.quantity -= qty;
    if (invItem.quantity <= 0) sender.inventory = sender.inventory.filter(i => i.itemId !== invItem.itemId);

    const existing = receiver.inventory.find(i => i.itemId === invItem.itemId);
    if (existing) existing.quantity += qty;
    else receiver.inventory.push({ itemId: invItem.itemId, name: invItem.name, emoji: invItem.emoji, quantity: qty, rarity: invItem.rarity });

    await sender.save(); await receiver.save();

    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(config.colors.success).setTitle('🎁 Gift Sent!')
        .setDescription(`**${interaction.user.username}** gifted **${qty}×** ${invItem.emoji} **${invItem.name}** to **${target.username}**!`)
        .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()],
    });
  },
};