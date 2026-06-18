const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('./database');
const { formatCredits, formatTime } = require('./embed');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('💰 View your cosmic wallet and galaxy bank balance')
    .addUserOption(opt => opt.setName('user').setDescription('View another user\'s balance').setRequired(false)),
  cooldown: 3,
  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    const user = await getUser(target.id);
    const total = user.wallet + user.bank;

    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle(`🌌 ${target.username}'s Cosmic Treasury`)
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '👛 Wallet', value: `☄️ **${user.wallet.toLocaleString()}** Credits`, inline: true },
        { name: '🏦 Galaxy Bank', value: `☄️ **${user.bank.toLocaleString()}** Credits`, inline: true },
        { name: '💎 Total Worth', value: `☄️ **${total.toLocaleString()}** Credits`, inline: true },
        { name: '🌌 Dark Matter', value: `🌌 **${user.darkMatter.toLocaleString()}**`, inline: true },
        { name: '⭐ Level', value: `**${user.level}** (${user.xp.toLocaleString()} XP)`, inline: true },
        { name: '🏅 Title', value: `*${user.title}*`, inline: true },
      )
      .setFooter({ text: '🌌 Nebula Bot • Galaxy Economy' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};