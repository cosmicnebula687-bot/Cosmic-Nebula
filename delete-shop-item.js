const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const ShopItem = require('./ShopItem');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('delete-shop-item')
    .setDescription('🗑️ Delete a shop item')
    .addStringOption(opt => opt.setName('id').setDescription('Item ID to delete').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  cooldown: 5,
  async execute(interaction) {
    const itemId = interaction.options.getString('id').toLowerCase();
    const item = await ShopItem.findOne({ itemId });
    if (!item) return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Item Not Found').setDescription(`No item with ID **${itemId}**.`).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('del_confirm').setLabel('🗑️ Delete').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('del_cancel').setLabel('Cancel').setStyle(ButtonStyle.Secondary),
    );
    const msg = await interaction.reply({
      embeds: [new EmbedBuilder().setColor(config.colors.warning).setTitle('⚠️ Confirm Deletion').setDescription(`Delete **${item.emoji} ${item.name}** from the shop?`).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()],
      components: [row], fetchReply: true,
    });

    const collector = msg.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: 30000 });
    collector.on('collect', async i => {
      collector.stop();
      if (i.customId === 'del_confirm') {
        await ShopItem.deleteOne({ itemId });
        await i.update({ embeds: [new EmbedBuilder().setColor(config.colors.success).setTitle('🗑️ Item Deleted').setDescription(`**${item.name}** removed from the shop.`).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], components: [] });
      } else {
        await i.update({ embeds: [new EmbedBuilder().setColor(config.colors.secondary).setTitle('❌ Cancelled').setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], components: [] });
      }
    });
    collector.on('end', async (_, r) => { if (r === 'time') await msg.edit({ components: [] }).catch(() => {}); });
  },
};