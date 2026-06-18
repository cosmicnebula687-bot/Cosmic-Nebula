const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('./database');
const { randomInt } = require('./embed');
const config = require('./config');

const PLANETS = [
  { name: 'Barren Rock', emoji: '🪨', cost: 2000, profitMin: 1500, profitMax: 8000 },
  { name: 'Frozen Moon', emoji: '🌙', cost: 5000, profitMin: 4000, profitMax: 15000 },
  { name: 'Gas Giant', emoji: '🪐', cost: 12000, profitMin: 10000, profitMax: 40000 },
  { name: 'Binary Star World', emoji: '⭐', cost: 30000, profitMin: 25000, profitMax: 100000 },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('terraform')
    .setDescription('🌍 Terraform a planet and develop it for galactic profit')
    .addStringOption(opt => opt.setName('planet').setDescription('Planet type to terraform').setRequired(true)
      .addChoices(...PLANETS.map(p => ({ name: `${p.emoji} ${p.name} (${p.cost.toLocaleString()} ☄️)`, value: p.name })))),
  cooldown: 86400,
  async execute(interaction) {
    const planetName = interaction.options.getString('planet');
    const planet = PLANETS.find(p => p.name === planetName);
    const user = await getUser(interaction.user.id);

    if (user.wallet < planet.cost)
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Insufficient Funds').setDescription(`Terraforming costs ☄️ **${planet.cost.toLocaleString()}** Credits.`).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    user.wallet -= planet.cost;
    const success = Math.random() > 0.15;
    if (success) {
      const profit = randomInt(planet.profitMin, planet.profitMax);
      user.wallet += profit;
      user.xp += randomInt(50, 200);
      await user.save();
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.gold).setTitle(`🌍 Terraform Success — ${planet.emoji} ${planet.name}`).setDescription('The planet bloomed into a thriving colony — galactic corporations pay top credits!').addFields({ name: '💰 Profit', value: `☄️ **${profit.toLocaleString()}** Credits`, inline: true }, { name: '👛 Balance', value: `☄️ **${user.wallet.toLocaleString()}** Credits`, inline: true }).setFooter({ text: '🌌 Nebula Bot • Terraform once per day!' }).setTimestamp()] });
    } else {
      await user.save();
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle(`🌍 Terraform Failed — ${planet.name}`).setDescription('Catastrophic geological events destroyed the terraforming equipment!').addFields({ name: '💸 Lost', value: `☄️ **${planet.cost.toLocaleString()}** Credits invested`, inline: true }).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()] });
    }
  },
};