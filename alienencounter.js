const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('./database');
const { randomInt } = require('./embed');
const config = require('./config');

const ALIENS = [
  { name: 'Zorvax Merchants', emoji: '👽', type: 'friendly', desc: 'They offer a trade deal you can\'t refuse!', reward: randomInt(500, 2000) },
  { name: 'Crystalline Entities', emoji: '💎', type: 'neutral', desc: 'They share their cosmic knowledge and gift you rare gems.', reward: randomInt(1000, 3000) },
  { name: 'Void Wraiths', emoji: '👻', type: 'hostile', desc: 'They phase through your hull and drain your energy cells!', reward: -randomInt(200, 800) },
  { name: 'Nebula Whales', emoji: '🐋', type: 'friendly', desc: 'The majestic beings share stardust from their migration trail.', reward: randomInt(300, 1500) },
  { name: 'Borg Collective Scouts', emoji: '🤖', type: 'hostile', desc: 'They attempt to assimilate your ship\'s AI!', reward: -randomInt(100, 500) },
  { name: 'Ancient Star Gods', emoji: '⭐', type: 'divine', desc: 'Beings of pure light bestow cosmic blessings upon you!', reward: randomInt(3000, 10000) },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('alienencounter')
    .setDescription('👽 Encounter random alien species during your travels'),
  cooldown: 3600,
  async execute(interaction) {
    const user = await getUser(interaction.user.id);
    const alien = ALIENS[Math.floor(Math.random() * ALIENS.length)];
    const reward = typeof alien.reward === 'function' ? alien.reward() : alien.reward;

    user.wallet = Math.max(0, user.wallet + reward);
    user.spaceStats.aliensEncountered++;
    user.xp += randomInt(10, 50);
    await user.save();

    const embed = new EmbedBuilder()
      .setColor(alien.type === 'hostile' ? config.colors.error : alien.type === 'divine' ? config.colors.gold : config.colors.success)
      .setTitle(`👽 Alien Encounter — ${alien.emoji} ${alien.name}`)
      .setDescription(alien.desc)
      .addFields(
        { name: reward >= 0 ? '💰 Gained' : '💸 Lost', value: `☄️ **${Math.abs(reward).toLocaleString()}** Credits`, inline: true },
        { name: '👽 Aliens Met', value: `**${user.spaceStats.aliensEncountered}**`, inline: true },
        { name: '👛 Balance', value: `☄️ **${user.wallet.toLocaleString()}** Credits`, inline: true },
      )
      .setFooter({ text: '🌌 Nebula Bot • You never know who you\'ll meet!' }).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};