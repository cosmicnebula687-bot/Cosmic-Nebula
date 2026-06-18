const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const ShopItem = require('./ShopItem');
const { rarityEmoji, rarityColor } = require('./embed');
const config = require('./config');

const CATEGORIES = [
  { label: '🚀 Ships', value: 'Ships' },
  { label: '🛸 Technology', value: 'Technology' },
  { label: '⚡ Boosters', value: 'Boosters' },
  { label: '🎨 Cosmetics', value: 'Cosmetics' },
  { label: '🧰 Utilities', value: 'Utilities' },
  { label: '🎁 Crates', value: 'Crates' },
  { label: '👑 Premium', value: 'Premium' },
];

const ITEMS_PER_PAGE = 5;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('🛒 Browse the Galactic Shop')
    .addStringOption(opt => opt.setName('category').setDescription('Filter by category').addChoices(
      { name: 'Ships', value: 'Ships' },
      { name: 'Technology', value: 'Technology' },
      { name: 'Boosters', value: 'Boosters' },
      { name: 'Cosmetics', value: 'Cosmetics' },
      { name: 'Utilities', value: 'Utilities' },
      { name: 'Crates', value: 'Crates' },
      { name: 'Premium', value: 'Premium' },
    ).setRequired(false)),
  cooldown: 5,
  async execute(interaction) {
    await interaction.deferReply();
    let category = interaction.options.getString('category') || null;
    let page = 0;

    const getItems = async (cat, pg) => {
      const query = cat ? { category: cat, enabled: true } : { enabled: true };
      const items = await ShopItem.find(query).skip(pg * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE);
      const total = await ShopItem.countDocuments(query);
      return { items, total, pages: Math.ceil(total / ITEMS_PER_PAGE) };
    };

    const buildEmbed = (items, total, pages, pg, cat) => {
      const embed = new EmbedBuilder()
        .setColor(config.colors.primary)
        .setTitle('🛒 Galactic Shop')
        .setDescription(cat ? `Browsing: **${cat}**` : 'All Categories')
        .setFooter({ text: `🌌 Nebula Bot • Page ${pg+1}/${Math.max(pages,1)} • Use /buy to purchase` }).setTimestamp();

      if (items.length === 0) {
        embed.setDescription('No items found in this category.');
      } else {
        for (const item of items) {
          embed.addFields({
            name: `${item.emoji} ${item.name} ${rarityEmoji(item.rarity)}`,
            value: `${item.description}\n☄️ **${item.price.toLocaleString()}** Credits | Rarity: **${item.rarity}** | ${item.buyable ? '✅ Buyable' : '❌'} ${item.sellable ? '• 🔄 Sellable' : ''} ${item.usable ? '• ⚡ Usable' : ''}`,
            inline: false,
          });
        }
      }
      return embed;
    };

    const buildComponents = (pg, pages) => {
      const select = new StringSelectMenuBuilder()
        .setCustomId('shop_cat')
        .setPlaceholder('📂 Filter by Category')
        .addOptions([{ label: '🌌 All Categories', value: 'all' }, ...CATEGORIES]);

      const navRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('shop_prev').setLabel('◀ Prev').setStyle(ButtonStyle.Secondary).setDisabled(pg === 0),
        new ButtonBuilder().setCustomId('shop_next').setLabel('Next ▶').setStyle(ButtonStyle.Secondary).setDisabled(pg >= pages - 1),
      );

      return [new ActionRowBuilder().addComponents(select), navRow];
    };

    const { items, total, pages } = await getItems(category, page);
    const msg = await interaction.editReply({ embeds: [buildEmbed(items, total, pages, page, category)], components: buildComponents(page, pages) });

    const collector = msg.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: 120000 });
    collector.on('collect', async i => {
      if (i.customId === 'shop_cat') {
        category = i.values[0] === 'all' ? null : i.values[0];
        page = 0;
      } else if (i.customId === 'shop_prev') page--;
      else if (i.customId === 'shop_next') page++;

      const { items: newItems, total: newTotal, pages: newPages } = await getItems(category, page);
      await i.update({ embeds: [buildEmbed(newItems, newTotal, newPages, page, category)], components: buildComponents(page, newPages) });
    });
    collector.on('end', () => interaction.editReply({ components: [] }).catch(() => {}));
  },
};