const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('./database');
const { randomInt } = require('./embed');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('salvage')
    .setDescription('🔧 Salvage loot from wrecked ships and debris fields'),
  cooldown: 3600,
  async execute(interaction) {
    const user = await getUser(interaction.user.id);
    const wrecks = [
      { name: 'Galactic Freighter', emoji: '🚢', reward: randomInt(500, 2000) },
      { name: 'Battle Cruiser Debris', emoji: '⚔️', reward: randomInt(1000, 3500) },
      { name: 'Pirate Vessel', emoji: '🏴‍☠️', reward: randomInt(300, 1500) },
      { name: 'Research Probe', emoji: '🔭', reward: randomInt(800, 2500) },
      { name: 'Derelict Space Station', emoji: '🛰️', reward: randomInt(2000, 6000) },
    ];
    const wreck = wrecks[Math.floor(Math.random() * wrecks.length)];
    const success = Math.random() > 0.2;
    if (success) { user.wallet += wreck.reward; user.xp += randomInt(10, 35); }
    await user.save();

    const embed = new EmbedBuilder()
      .setColor(success ? config.colors.success : config.colors.error)
      .setTitle(`🔧 Salvage Operation — ${wreck.emoji} ${wreck.name}`)
      .setDescription(success
        ? `You successfully stripped the **${wreck.name}** of valuable components!`
        : `The **${wreck.name}** had already been looted. Nothing left to salvage.`)
      .addFields(
        { name: '💰 Salvaged', value: success ? `☄️ **${wreck.reward.toLocaleString()}** Credits` : 'Nothing', inline: true },
        { name: '👛 Balance', value: `☄️ **${user.wallet.toLocaleString()}** Credits`, inline: true },
      )
      .setFooter({ text: '🌌 Nebula Bot • Salvage again in 1 hour!' }).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};