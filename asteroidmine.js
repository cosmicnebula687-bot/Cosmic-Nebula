const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('./database');
const { randomInt } = require('./embed');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('asteroidmine')
    .setDescription('⛏️ Mine asteroids for Cosmic Credits and rare materials'),
  cooldown: 3600,
  async execute(interaction) {
    const user = await getUser(interaction.user.id);
    const outcomes = [
      { name: 'Iron Asteroid', emoji: '🪨', min: 150, max: 400, chance: 0.40 },
      { name: 'Platinum Asteroid', emoji: '⚪', min: 400, max: 900, chance: 0.30 },
      { name: 'Crystal Cluster', emoji: '💎', min: 900, max: 2000, chance: 0.18 },
      { name: 'Dark Matter Vein', emoji: '🌌', min: 2000, max: 5000, chance: 0.08 },
      { name: 'Void Crystal (RARE)', emoji: '🔮', min: 5000, max: 12000, chance: 0.04 },
    ];
    const roll = Math.random();
    let cumulative = 0, found = outcomes[0];
    for (const o of outcomes) { cumulative += o.chance; if (roll < cumulative) { found = o; break; } }

    const earned = randomInt(found.min, found.max);
    user.wallet += earned;
    user.spaceStats.asteroidsMinedTotal++;
    user.xp += randomInt(10, 30);
    await user.save();

    const embed = new EmbedBuilder()
      .setColor(config.colors.secondary)
      .setTitle('⛏️ Asteroid Mining Complete!')
      .setDescription(`You piloted your drill ship into the asteroid belt and struck **${found.emoji} ${found.name}**!`)
      .addFields(
        { name: '💰 Credits Mined', value: `☄️ **${earned.toLocaleString()}** Credits`, inline: true },
        { name: '👛 Balance', value: `☄️ **${user.wallet.toLocaleString()}** Credits`, inline: true },
        { name: '⛏️ Total Mined', value: `**${user.spaceStats.asteroidsMinedTotal}** asteroids`, inline: true },
      )
      .setFooter({ text: '🌌 Nebula Bot • Mine again in 1 hour!' }).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};