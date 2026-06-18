const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('./database');
const { randomInt } = require('./embed');
const config = require('./config');

const EXPEDITIONS = [
  { name: 'Deep Space Survey', emoji: '🔭', duration: '6 hours', reward: { min: 3000, max: 8000 }, xp: 150 },
  { name: 'Black Hole Mapping', emoji: '🌑', duration: '12 hours', reward: { min: 8000, max: 20000 }, xp: 300 },
  { name: 'Galactic Core Run', emoji: '🌌', duration: '24 hours', reward: { min: 20000, max: 50000 }, xp: 600 },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('spaceexpedition')
    .setDescription('🚀 Launch a long expedition for massive rewards')
    .addStringOption(opt => opt.setName('mission').setDescription('Expedition to launch').setRequired(true)
      .addChoices(...EXPEDITIONS.map(e => ({ name: `${e.emoji} ${e.name} (${e.duration})`, value: e.name })))),
  cooldown: 3600,
  async execute(interaction) {
    const missionName = interaction.options.getString('mission');
    const expedition = EXPEDITIONS.find(e => e.name === missionName);
    const user = await getUser(interaction.user.id);

    const success = Math.random() > 0.2;
    if (success) {
      const reward = randomInt(expedition.reward.min, expedition.reward.max);
      user.wallet += reward;
      user.xp += expedition.xp;
      user.spaceStats.expeditionsCompleted++;
      await user.save();
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.gold).setTitle(`🚀 Expedition Complete — ${expedition.emoji} ${expedition.name}`).setDescription('Your crew returned victorious after a long journey!').addFields({ name: '💰 Earned', value: `☄️ **${reward.toLocaleString()}** Credits`, inline: true }, { name: '✨ XP', value: `+**${expedition.xp}** XP`, inline: true }, { name: '🚀 Expeditions', value: `**${user.spaceStats.expeditionsCompleted}**`, inline: true }).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()] });
    } else {
      const loss = randomInt(500, 2000);
      user.wallet = Math.max(0, user.wallet - loss);
      await user.save();
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle(`🚀 Expedition Failed — ${expedition.name}`).setDescription('Your ship suffered critical damage and was forced to return.').addFields({ name: '💸 Repair Cost', value: `☄️ **${loss.toLocaleString()}** Credits`, inline: true }).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()] });
    }
  },
};