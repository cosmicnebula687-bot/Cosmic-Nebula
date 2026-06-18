const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('./database');
const { randomInt } = require('./embed');
const config = require('./config');

const STATIONS = [
  { name: 'Abandoned Trading Post', emoji: '🏪', lootMin: 500, lootMax: 2000, danger: 0.2 },
  { name: 'Derelict Military Base', emoji: '🏗️', lootMin: 2000, lootMax: 6000, danger: 0.4 },
  { name: 'Ghost Station Omega', emoji: '👻', lootMin: 4000, lootMax: 12000, danger: 0.55 },
  { name: 'Forbidden Research Lab', emoji: '🔬', lootMin: 8000, lootMax: 25000, danger: 0.65 },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('galaxyraid')
    .setDescription('🏴‍☠️ Raid an abandoned space station for massive loot'),
  cooldown: 10800,
  async execute(interaction) {
    const user = await getUser(interaction.user.id);
    const station = STATIONS[Math.floor(Math.random() * STATIONS.length)];
    const survived = Math.random() > station.danger;

    if (survived) {
      const loot = randomInt(station.lootMin, station.lootMax);
      user.wallet += loot;
      user.xp += randomInt(30, 90);
      await user.save();
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.gold).setTitle(`🏴‍☠️ Galaxy Raid — ${station.emoji} ${station.name}`).setDescription('Your crew breached the station and emptied the vaults!').addFields({ name: '💰 Looted', value: `☄️ **${loot.toLocaleString()}** Credits`, inline: true }, { name: '👛 Balance', value: `☄️ **${user.wallet.toLocaleString()}** Credits`, inline: true }).setFooter({ text: '🌌 Nebula Bot • Raid again in 3 hours!' }).setTimestamp()] });
    } else {
      const fine = randomInt(200, 800);
      user.wallet = Math.max(0, user.wallet - fine);
      await user.save();
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle(`🚨 Galaxy Raid — Foiled at ${station.name}!`).setDescription('Security drones activated! Your crew barely escaped.').addFields({ name: '💸 Lost', value: `☄️ **${fine.toLocaleString()}** Credits in damage`, inline: true }, { name: '👛 Balance', value: `☄️ **${user.wallet.toLocaleString()}** Credits`, inline: true }).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()] });
    }
  },
};