const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('./database');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wheel')
    .setDescription('🎡 Spin the Nebula Fortune Wheel')
    .addIntegerOption(opt => opt.setName('bet').setDescription('Amount to bet').setRequired(true).setMinValue(10)),
  cooldown: 3,
  async execute(interaction) {
    const bet = interaction.options.getInteger('bet');
    const user = await getUser(interaction.user.id);

    if (user.wallet < bet)
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Insufficient Funds').setDescription(`You only have ☄️ **${user.wallet.toLocaleString()}** Credits.`).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    const segments = config.gambling.wheelSegments;
    const totalWeight = segments.reduce((a, b) => a + b.weight, 0);
    let r = Math.random() * totalWeight;
    let result = segments[segments.length - 1];
    for (const seg of segments) { r -= seg.weight; if (r <= 0) { result = seg; break; } }

    const winnings = Math.floor(bet * result.multiplier);
    const change = winnings - bet;
    const won = result.multiplier > 1;

    user.wallet += change;
    user.gamblingStats.gamesPlayed++;
    if (change > 0) { user.gamblingStats.totalWon += winnings; if (winnings > user.gamblingStats.biggestWin) user.gamblingStats.biggestWin = winnings; }
    else if (change < 0) user.gamblingStats.totalLost += bet;
    await user.save();

    const wheelDisplay = segments.map(s => s === result ? `**→ ${s.label} ←**` : s.label).join('\n');

    const embed = new EmbedBuilder()
      .setColor(result.color)
      .setTitle('🎡 Nebula Fortune Wheel')
      .setDescription(`The cosmic wheel spins...\n\n${wheelDisplay}`)
      .addFields(
        { name: '🎯 Result', value: result.label, inline: true },
        { name: '💎 Multiplier', value: `**${result.multiplier}x**`, inline: true },
        { name: change >= 0 ? '💰 Won' : '💸 Lost', value: `☄️ **${Math.abs(change).toLocaleString()}** Credits`, inline: true },
        { name: '👛 Balance', value: `☄️ **${user.wallet.toLocaleString()}** Credits`, inline: true },
      )
      .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};