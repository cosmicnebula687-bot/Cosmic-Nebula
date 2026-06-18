const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('./database');
const ShopItem = require('./ShopItem');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('use')
    .setDescription('⚡ Use an item from your inventory')
    .addStringOption(opt => opt.setName('item').setDescription('Item name to use').setRequired(true)),
  cooldown: 3,
  async execute(interaction) {
    const itemInput = interaction.options.getString('item').toLowerCase();
    const user = await getUser(interaction.user.id);

    const invItem = user.inventory.find(i => i.name.toLowerCase().includes(itemInput) || i.itemId === itemInput);
    if (!invItem)
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Item Not Found').setDescription(`You don't have **${itemInput}** in your inventory.`).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    const shopItem = await ShopItem.findOne({ itemId: invItem.itemId });
    if (!shopItem || !shopItem.usable)
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Not Usable').setDescription(`**${invItem.name}** cannot be used.`).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    // Process effects
    let effectMessage = '';
    switch (shopItem.useEffect) {
      case 'mining_boost': effectMessage = '⛏️ Mining yield boosted by 10% for 1 hour!'; break;
      case 'cooldown_reduce': effectMessage = '⚡ Travel cooldowns reduced by 20% for 1 hour!'; break;
      case 'work_boost': effectMessage = '🤖 Work earnings doubled for 24 hours!'; break;
      case 'credit_boost': effectMessage = '☄️ Credit earnings doubled for 1 hour!'; break;
      case 'xp_boost': effectMessage = '✨ XP gain doubled for 1 hour!'; break;
      case 'luck_boost': effectMessage = '🍀 Gambling luck increased for 30 minutes!'; break;
      case 'rob_shield': effectMessage = '🛡️ Robbery protection active for 2 hours!'; break;
      case 'title_nebula': user.title = 'Nebula Walker'; effectMessage = '🎨 Title changed to **Nebula Walker**!'; break;
      case 'grant_dark_matter_100': user.darkMatter += 100; effectMessage = '🌌 Received **100 Dark Matter**!'; break;
      case 'grant_vip': effectMessage = '👑 VIP Galactic Pass activated for 30 days!'; break;
      case 'open_crate_common': {
        const credits = Math.floor(Math.random() * 500) + 100;
        user.wallet += credits;
        effectMessage = `📦 Common Crate opened! Found ☄️ **${credits.toLocaleString()}** Credits!`;
        break;
      }
      case 'open_crate_nebula': {
        const credits = Math.floor(Math.random() * 3000) + 1000;
        user.wallet += credits;
        effectMessage = `🎁 Nebula Crate opened! Found ☄️ **${credits.toLocaleString()}** Credits!`;
        break;
      }
      default: effectMessage = `⚡ Used **${invItem.name}**! Effect applied.`;
    }

    invItem.quantity -= 1;
    if (invItem.quantity <= 0) user.inventory = user.inventory.filter(i => i.itemId !== invItem.itemId);
    await user.save();

    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(config.colors.success).setTitle(`⚡ Item Used: ${invItem.emoji} ${invItem.name}`)
        .setDescription(effectMessage)
        .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()],
    });
  },
};