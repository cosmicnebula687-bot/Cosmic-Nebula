const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('./database');
const { randomInt } = require('./embed');
const config = require('./config');

const CATCHES = [
  { name: 'Void Jellyfish', emoji: '🪼', value: 200, rarity: 'Common' },
  { name: 'Nebula Eel', emoji: '🐍', value: 500, rarity: 'Uncommon' },
  { name: 'Crystal Starfish', emoji: '⭐', value: 1200, rarity: 'Rare' },
  { name: 'Plasma Leviathan', emoji: '🐋', value: 3000, rarity: 'Epic' },
  { name: 'Dark Matter Kraken', emoji: '🦑', value: 8000, rarity: 'Legendary' },
  { name: '🪨 Just a rock', emoji: '🪨', value: 10, rarity: 'Common' },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('spacefishing')
    .setDescription('🎣 Cast your gravity net to catch alien creatures'),
  cooldown: 1800,
  async execute(interaction) {
    const user = await getUser(interaction.user.id);
    const weights = [40, 28, 18, 9, 2, 30];
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    let caught = CATCHES[CATCHES.length - 1];
    for (let i = 0; i < CATCHES.length; i++) { r -= weights[i]; if (r <= 0) { caught = CATCHES[i]; break; } }

    user.wallet += caught.value;
    user.xp += randomInt(5, 20);
    await user.save();

    const embed = new EmbedBuilder()
      .setColor(caught.rarity === 'Legendary' ? config.colors.gold : caught.rarity === 'Epic' ? 0x9B59B6 : caught.rarity === 'Rare' ? config.colors.secondary : config.colors.success)
      .setTitle('🎣 Space Fishing Results!')
      .setDescription(`You cast your gravity net into the void...`)
      .addFields(
        { name: '🐟 Caught', value: `${caught.emoji} **${caught.name}** (${caught.rarity})`, inline: true },
        { name: '💰 Value', value: `☄️ **${caught.value.toLocaleString()}** Credits`, inline: true },
        { name: '👛 Balance', value: `☄️ **${user.wallet.toLocaleString()}** Credits`, inline: true },
      )
      .setFooter({ text: '🌌 Nebula Bot • Fish again in 30 minutes!' }).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};