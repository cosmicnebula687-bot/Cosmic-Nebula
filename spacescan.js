const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('./database');
const { randomInt } = require('./embed');
const config = require('./config');

const PLANETS = ['Zephyros IV', 'Nexar Prime', 'Veloria-7', 'Drakon Station', 'The Nebula Core', 'Proxima Outpost', 'Obsidian Ring'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('spacescan')
    .setDescription('🔭 Scan nearby planets for hidden treasures'),
  cooldown: 1800,
  async execute(interaction) {
    const user = await getUser(interaction.user.id);
    const planet = PLANETS[Math.floor(Math.random() * PLANETS.length)];
    const found = Math.random() > 0.3;
    const earned = found ? randomInt(200, 3000) : 0;

    if (found) user.wallet += earned;
    user.xp += randomInt(5, 20);
    await user.save();

    const embed = new EmbedBuilder()
      .setColor(found ? config.colors.success : config.colors.warning)
      .setTitle('🔭 Space Scan Results')
      .setDescription(found
        ? `Your scanners detected a treasure cache on **${planet}**! You retrieved it before anyone else!`
        : `Your scanners swept **${planet}** but found nothing of value. Better luck next time!`)
      .addFields(
        { name: '🪐 Target Planet', value: planet, inline: true },
        { name: '💰 Treasure', value: found ? `☄️ **${earned.toLocaleString()}** Credits` : 'Nothing found', inline: true },
        { name: '👛 Balance', value: `☄️ **${user.wallet.toLocaleString()}** Credits`, inline: true },
      )
      .setFooter({ text: '🌌 Nebula Bot • Scan again in 30 minutes!' }).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};