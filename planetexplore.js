const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('./database');
const { randomInt } = require('./embed');
const config = require('./config');

const DISCOVERIES = [
  { name: 'Ancient Alien Ruins', emoji: '🏛️', reward: 3000, desc: 'You discovered ancient ruins filled with alien artifacts!' },
  { name: 'Rare Mineral Deposit', emoji: '💎', reward: 2000, desc: 'A massive deposit of rare minerals lines the canyon walls.' },
  { name: 'Crashed Freighter', emoji: '🛸', reward: 1500, desc: 'You found a crashed freighter with salvageable cargo!' },
  { name: 'Hostile Alien Territory', emoji: '👾', reward: -500, desc: 'Hostile aliens chased you off the planet. You lost some gear.' },
  { name: 'Breathtaking Views Only', emoji: '🌄', reward: 100, desc: 'Beautiful scenery, but nothing valuable to take home.' },
  { name: 'Underground Ocean', emoji: '🌊', reward: 2500, desc: 'An underground ocean teeming with alien life — you sold the data!' },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('planetexplore')
    .setDescription('🪐 Explore an unknown planet for discoveries and rewards'),
  cooldown: 7200,
  async execute(interaction) {
    const user = await getUser(interaction.user.id);
    const d = DISCOVERIES[Math.floor(Math.random() * DISCOVERIES.length)];
    user.wallet = Math.max(0, user.wallet + d.reward);
    user.spaceStats.planetsExplored++;
    user.xp += randomInt(20, 60);
    await user.save();

    const embed = new EmbedBuilder()
      .setColor(d.reward > 0 ? config.colors.success : config.colors.error)
      .setTitle(`🪐 Planet Exploration — ${d.emoji} ${d.name}`)
      .setDescription(d.desc)
      .addFields(
        { name: d.reward >= 0 ? '💰 Earned' : '💸 Lost', value: `☄️ **${Math.abs(d.reward).toLocaleString()}** Credits`, inline: true },
        { name: '🪐 Planets Explored', value: `**${user.spaceStats.planetsExplored}**`, inline: true },
        { name: '👛 Balance', value: `☄️ **${user.wallet.toLocaleString()}** Credits`, inline: true },
      )
      .setFooter({ text: '🌌 Nebula Bot • Explore again in 2 hours!' }).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};