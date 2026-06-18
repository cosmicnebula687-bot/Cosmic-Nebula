const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('./database');
const { randomInt } = require('./embed');
const config = require('./config');

const QUESTS = [
  { id: 'hunt_pirate', name: 'Hunt Space Pirates', desc: 'Defeat 3 pirate ships in the outer rim.', reward: 1500, xp: 100, emoji: '🏴‍☠️' },
  { id: 'deliver_cargo', name: 'Cargo Run', desc: 'Deliver supplies to 5 space stations.', reward: 800, xp: 60, emoji: '📦' },
  { id: 'mine_asteroid', name: 'Asteroid Mining Run', desc: 'Mine 10 asteroids for rare materials.', reward: 2000, xp: 150, emoji: '⛏️' },
  { id: 'explore_nebula', name: 'Nebula Expedition', desc: 'Chart unexplored regions of the nebula.', reward: 3000, xp: 200, emoji: '🌌' },
  { id: 'rescue_mission', name: 'Rescue Mission', desc: 'Save stranded travelers from a black hole.', reward: 2500, xp: 180, emoji: '🚨' },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quest')
    .setDescription('📜 View and complete galactic quests'),
  cooldown: 10,
  async execute(interaction) {
    const user = await getUser(interaction.user.id);
    const quest = QUESTS[Math.floor(Math.random() * QUESTS.length)];
    const success = Math.random() > 0.35;

    if (success) {
      user.wallet += quest.reward;
      user.xp += quest.xp;
    }
    await user.save();

    const embed = new EmbedBuilder()
      .setColor(success ? config.colors.success : config.colors.error)
      .setTitle(`${quest.emoji} Quest: ${quest.name}`)
      .setDescription(quest.desc)
      .addFields(
        { name: '📊 Result', value: success ? '✅ Quest Completed!' : '❌ Quest Failed', inline: true },
        { name: '💰 Reward', value: success ? `☄️ **${quest.reward.toLocaleString()}** Credits` : 'None', inline: true },
        { name: '✨ XP', value: success ? `+**${quest.xp}** XP` : '+0 XP', inline: true },
        { name: '👛 Balance', value: `☄️ **${user.wallet.toLocaleString()}** Credits`, inline: true },
      )
      .setFooter({ text: '🌌 Nebula Bot • New quests available each time!' }).setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};