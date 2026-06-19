const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { getUser } = require('./database');
const { rarityEmoji } = require('./embed');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('🎒 View your cosmic inventory')
    .addUserOption(opt => opt.setName('user').setDescription('User to view').setRequired(false)),
  cooldown: 5,
  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    const user = await getUser(target.id);

    if (user.inventory.length === 0) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(config.colors.warning).setTitle('🎒 Empty Inventory').setDescription(`${target.username} hasn't collected any items yet!\nVisit the **/shop** to get started.`).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()],
      });
    }

    const ITEMS_PER_PAGE = 8;
    const pages = Math.ceil(user.inventory.length / ITEMS_PER_PAGE);
    let page = 0;

    const buildEmbed = (p) => {
      const start = p * ITEMS_PER_PAGE;
      const items = user.inventory.slice(start, start + ITEMS_PER_PAGE);
      const desc = items.map(item => `${item.emoji || '📦'} **${item.name}** ${rarityEmoji(item.rarity)} ×${item.quantity}`).join('\n');
      return new EmbedBuilder()
        .setColor(config.colors.primary)
        .setTitle(`🎒 ${target.username}'s Inventory`)
        .setDescription(desc)
        .setFooter({ text: `🌌 Nebula Bot • Page ${p+1}/${pages} • ${user.inventory.length} items` }).setTimestamp();
    };

    const buildRow = (p) => new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('inv_prev').setLabel('◀ Prev').setStyle(ButtonStyle.Secondary).setDisabled(p === 0),
      new ButtonBuilder().setCustomId('inv_next').setLabel('Next ▶').setStyle(ButtonStyle.Secondary).setDisabled(p >= pages - 1),
    );

    const msg = await interaction.reply({ embeds: [buildEmbed(page)], components: pages > 1 ? [buildRow(page)] : [], fetchReply: true });
    if (pages <= 1) return;

    const collector = msg.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: 60000 });
    collector.on('collect', async i => {
      if (i.customId === 'inv_prev') page--;
      else page++;
      await i.update({ embeds: [buildEmbed(page)], components: [buildRow(page)] });
    });
    collector.on('end', () => msg.edit({ components: [] }).catch(() => {}));
  },
};
