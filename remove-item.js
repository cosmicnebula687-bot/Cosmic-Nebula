const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getUser } = require('./database');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove-item')
    .setDescription('🗑️ Remove an item from a user\'s inventory')
    .addUserOption(opt => opt.setName('user').setDescription('User to remove item from').setRequired(true))
    .addStringOption(opt => opt.setName('item').setDescription('Item ID').setRequired(true))
    .addIntegerOption(opt => opt.setName('quantity').setDescription('Quantity to remove').setRequired(false).setMinValue(1))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  cooldown: 3,
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const itemId = interaction.options.getString('item').toLowerCase();
    const qty = interaction.options.getInteger('quantity') || 1;
    const user = await getUser(target.id);

    const invItem = user.inventory.find(i => i.itemId === itemId);
    if (!invItem) return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Item Not In Inventory').setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    invItem.quantity -= qty;
    if (invItem.quantity <= 0) user.inventory = user.inventory.filter(i => i.itemId !== itemId);
    await user.save();

    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(config.colors.success).setTitle('🗑️ Item Removed')
        .addFields({ name: '👤 User', value: target.tag, inline: true }, { name: '🗑️ Item', value: `${itemId} ×${qty}`, inline: true })
        .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()],
    });
  },
};