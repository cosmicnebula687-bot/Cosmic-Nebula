const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const User = require('./User');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('🏆 View the Galactic Leaderboard')
    .addStringOption(opt => opt.setName('type').setDescription('Leaderboard type').addChoices(
      { name: '💰 Richest', value: 'rich' },
      { name: '⭐ Top Level', value: 'level' },
      { name: '🎰 Gambling', value: 'gambling' },
      { name: '⭐ Reputation', value: 'rep' },
    )),
  cooldown: 10,
  async execute(interaction) {
    const type = interaction.options.getString('type') || 'rich';
    await interaction.deferReply();

    let users, title, fieldFn;
    if (type === 'rich') {
      users = await User.find().sort({ wallet: -1 }).limit(10);
      title = '💰 Galactic Richest';
      fieldFn = (u, i) => `**${i+1}.** <@${u.userId}> — ☄️ ${u.wallet.toLocaleString()} Credits`;
    } else if (type === 'level') {
      users = await User.find().sort({ level: -1, xp: -1 }).limit(10);
      title = '⭐ Galactic Top Levels';
      fieldFn = (u, i) => `**${i+1}.** <@${u.userId}> — Level ${u.level} (${u.xp.toLocaleString()} XP)`;
    } else if (type === 'gambling') {
      users = await User.find().sort({ 'gamblingStats.totalWon': -1 }).limit(10);
      title = '🎰 Top Galactic Gamblers';
      fieldFn = (u, i) => `**${i+1}.** <@${u.userId}> — ☄️ ${u.gamblingStats.totalWon.toLocaleString()} Won`;
    } else {
      users = await User.find().sort({ reputation: -1 }).limit(10);
      title = '⭐ Most Reputable';
      fieldFn = (u, i) => `**${i+1}.** <@${u.userId}> — ⭐ ${u.reputation} Rep`;
    }

    const medals = ['🥇', '🥈', '🥉'];
    const desc = users.map((u, i) => `${medals[i] || `**${i+1}.**`} <@${u.userId}>${
      type === 'rich' ? ` — ☄️ ${u.wallet.toLocaleString()}` :
      type === 'level' ? ` — Level ${u.level}` :
      type === 'gambling' ? ` — ☄️ ${u.gamblingStats.totalWon.toLocaleString()} Won` :
      ` — ⭐ ${u.reputation} Rep`
    }`).join('\n') || 'No data yet.';

    const embed = new EmbedBuilder()
      .setColor(config.colors.gold)
      .setTitle(`🏆 ${title}`)
      .setDescription(desc)
      .setFooter({ text: '🌌 Nebula Bot • Updated live' }).setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};