const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('./database');
const { randomInt } = require('./embed');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wormhole')
    .setDescription('🌀 Enter a risky wormhole — high risk, high reward')
    .addIntegerOption(opt => opt.setName('bet').setDescription('Credits to risk').setRequired(true).setMinValue(100)),
  cooldown: 7200,
  async execute(interaction) {
    const bet = interaction.options.getInteger('bet');
    const user = await getUser(interaction.user.id);

    if (user.wallet < bet)
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Insufficient Funds').setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    const outcomes = [
      { name: 'Jackpot System!', emoji: '🌟', multiplier: 10, chance: 0.05, desc: 'The wormhole led to a treasure-filled system!' },
      { name: 'Rich Sector', emoji: '💰', multiplier: 4, chance: 0.15, desc: 'You emerged in a wealthy trading hub!' },
      { name: 'Safe Passage', emoji: '✅', multiplier: 2, chance: 0.30, desc: 'A smooth journey to a profitable sector.' },
      { name: 'Gravity Trap', emoji: '🌑', multiplier: 0, chance: 0.30, desc: 'Gravity ripped your ship apart. You lost your investment.' },
      { name: 'Anomaly Detected', emoji: '⚠️', multiplier: 0.5, chance: 0.20, desc: 'Strange anomalies damaged your cargo mid-transit.' },
    ];

    let r = Math.random(), cum = 0, result = outcomes[outcomes.length - 1];
    for (const o of outcomes) { cum += o.chance; if (r < cum) { result = o; break; } }

    const earned = Math.floor(bet * result.multiplier);
    const change = earned - bet;
    user.wallet = Math.max(0, user.wallet + change);
    user.xp += randomInt(20, 80);
    await user.save();

    const embed = new EmbedBuilder()
      .setColor(change > 0 ? config.colors.success : change < 0 ? config.colors.error : config.colors.warning)
      .setTitle(`🌀 Wormhole — ${result.emoji} ${result.name}`)
      .setDescription(result.desc)
      .addFields(
        { name: '💎 Multiplier', value: `**${result.multiplier}x**`, inline: true },
        { name: change >= 0 ? '💰 Result' : '💸 Result', value: `☄️ **${Math.abs(change).toLocaleString()}** Credits ${change >= 0 ? 'gained' : 'lost'}`, inline: true },
        { name: '👛 Balance', value: `☄️ **${user.wallet.toLocaleString()}** Credits`, inline: true },
      )
      .setFooter({ text: '🌌 Nebula Bot • Wormholes recharge in 2 hours!' }).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};