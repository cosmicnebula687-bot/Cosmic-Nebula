const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('./database');
const config = require('./config');
const SYMBOLS = ['🌌', '☄️', '🚀', '⭐', '🪐', '🌙', '🛸', '💫'];
const WEIGHTS = [1, 2, 3, 5, 6, 7, 8, 10]; // lower = rarer

function weightedSymbol() {
  const total = WEIGHTS.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < WEIGHTS.length; i++) {
    r -= WEIGHTS[i];
    if (r <= 0) return SYMBOLS[i];
  }
  return SYMBOLS[SYMBOLS.length - 1];
}

function getMultiplier(s1, s2, s3) {
  if (s1 === s2 && s2 === s3) {
    if (s1 === '🌌') return 50;
    if (s1 === '☄️') return 20;
    if (s1 === '🚀') return 10;
    if (s1 === '⭐') return 7;
    return 5;
  }
  if (s1 === s2 || s2 === s3 || s1 === s3) return 1.5;
  return 0;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slots')
    .setDescription('🎰 Spin the Galactic Slot Machine')
    .addIntegerOption(opt => opt.setName('bet').setDescription('Amount to bet').setRequired(true).setMinValue(10)),
  cooldown: 3,
  async execute(interaction) {
    const bet = interaction.options.getInteger('bet');
    const user = await getUser(interaction.user.id);

    if (user.wallet < bet)
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Insufficient Funds').setDescription(`You only have ☄️ **${user.wallet.toLocaleString()}** Credits.`).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    const s1 = weightedSymbol(), s2 = weightedSymbol(), s3 = weightedSymbol();
    const multiplier = getMultiplier(s1, s2, s3);
    const won = multiplier > 0;
    const winnings = Math.floor(bet * multiplier);
    const change = won ? winnings - bet : -bet;

    user.wallet += change;
    user.gamblingStats.gamesPlayed++;
    if (won) { user.gamblingStats.totalWon += winnings; if (winnings > user.gamblingStats.biggestWin) user.gamblingStats.biggestWin = winnings; }
    else user.gamblingStats.totalLost += bet;
    await user.save();

    let resultText = won ? (multiplier >= 10 ? '🎉 JACKPOT! Cosmic alignment!' : '✨ Winner!') : '💫 No match — the stars weren\'t aligned.';

    const embed = new EmbedBuilder()
      .setColor(won ? (multiplier >= 10 ? config.colors.gold : config.colors.success) : config.colors.error)
      .setTitle('🎰 Galactic Slot Machine')
      .setDescription(`╔═══════════════╗\n║ ${s1}  ${s2}  ${s3} ║\n╚═══════════════╝\n\n${resultText}`)
      .addFields(
        { name: '💎 Multiplier', value: `**${multiplier}x**`, inline: true },
        { name: won ? '💰 Won' : '💸 Lost', value: `☄️ **${Math.abs(change).toLocaleString()}** Credits`, inline: true },
        { name: '👛 Balance', value: `☄️ **${user.wallet.toLocaleString()}** Credits`, inline: true },
      )
      .setFooter({ text: '🌌 Nebula Bot • 🌌=50x ☄️=20x 🚀=10x' }).setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};