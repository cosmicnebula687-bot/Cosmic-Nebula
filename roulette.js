const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('./database');
const config = require('./config');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('roulette')
    .setDescription('🎡 Spin the Cosmic Roulette Wheel')
    .addIntegerOption(opt => opt.setName('bet').setDescription('Amount to bet').setRequired(true).setMinValue(10))
    .addStringOption(opt => opt.setName('choice').setDescription('What to bet on').setRequired(true)
      .addChoices(
        { name: '🔴 Red (2x)', value: 'red' },
        { name: '⚫ Black (2x)', value: 'black' },
        { name: '🟢 Green (14x)', value: 'green' },
        { name: '⬆️ High 19-36 (2x)', value: 'high' },
        { name: '⬇️ Low 1-18 (2x)', value: 'low' },
        { name: '🔢 Even (2x)', value: 'even' },
        { name: '🔢 Odd (2x)', value: 'odd' },
      )),
  cooldown: 3,
  async execute(interaction) {
    const bet = interaction.options.getInteger('bet');
    const choice = interaction.options.getString('choice');
    const user = await getUser(interaction.user.id);

    if (user.wallet < bet)
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Insufficient Funds').setDescription(`You only have ☄️ **${user.wallet.toLocaleString()}** Credits.`).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    const spin = Math.floor(Math.random() * 37); // 0-36
    const reds = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
    const isRed = reds.includes(spin);
    const isGreen = spin === 0;
    const spinColor = isGreen ? '🟢' : isRed ? '🔴' : '⚫';

    let won = false;
    let multiplier = 2;
    if (choice === 'red' && isRed) { won = true; multiplier = 2; }
    else if (choice === 'black' && !isRed && !isGreen) { won = true; multiplier = 2; }
    else if (choice === 'green' && isGreen) { won = true; multiplier = 14; }
    else if (choice === 'high' && spin >= 19 && spin <= 36) { won = true; multiplier = 2; }
    else if (choice === 'low' && spin >= 1 && spin <= 18) { won = true; multiplier = 2; }
    else if (choice === 'even' && spin !== 0 && spin % 2 === 0) { won = true; multiplier = 2; }
    else if (choice === 'odd' && spin % 2 !== 0) { won = true; multiplier = 2; }

    const winnings = Math.floor(bet * multiplier);
    const change = won ? winnings - bet : -bet;

    user.wallet += change;
    user.gamblingStats.gamesPlayed++;
    if (won) { user.gamblingStats.totalWon += winnings; if (winnings > user.gamblingStats.biggestWin) user.gamblingStats.biggestWin = winnings; }
    else user.gamblingStats.totalLost += bet;
    await user.save();

    const embed = new EmbedBuilder()
      .setColor(won ? config.colors.success : config.colors.error)
      .setTitle('🎡 Cosmic Roulette')
      .setDescription(`The galactic wheel spins...\n\nThe ball lands on **${spinColor} ${spin}**!`)
      .addFields(
        { name: '🎯 Your Bet', value: choice.charAt(0).toUpperCase() + choice.slice(1), inline: true },
        { name: won ? '💰 Won' : '💸 Lost', value: `☄️ **${Math.abs(change).toLocaleString()}** Credits`, inline: true },
        { name: '👛 Balance', value: `☄️ **${user.wallet.toLocaleString()}** Credits`, inline: true },
      )
      .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};