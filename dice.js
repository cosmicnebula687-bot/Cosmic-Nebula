const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('./database');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dice')
    .setDescription('🎲 Roll cosmic dice against the galaxy')
    .addIntegerOption(opt => opt.setName('bet').setDescription('Amount to bet').setRequired(true).setMinValue(10)),
  cooldown: 3,
  async execute(interaction) {
    const bet = interaction.options.getInteger('bet');
    const user = await getUser(interaction.user.id);

    if (user.wallet < bet)
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Insufficient Funds').setDescription(`You only have ☄️ **${user.wallet.toLocaleString()}** Credits.`).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    const playerRoll = Math.floor(Math.random() * 6) + 1;
    const botRoll = Math.floor(Math.random() * 6) + 1;
    const diceFaces = ['', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣'];

    let won, change, resultText;
    if (playerRoll > botRoll) { won = true; change = bet; resultText = '🎉 You beat the galaxy!'; }
    else if (playerRoll < botRoll) { won = false; change = -bet; resultText = '💫 The galaxy wins this round!'; }
    else { won = null; change = 0; resultText = '🤝 A cosmic tie!'; }

    user.wallet += change;
    user.gamblingStats.gamesPlayed++;
    if (won === true) { user.gamblingStats.totalWon += bet; if (bet > user.gamblingStats.biggestWin) user.gamblingStats.biggestWin = bet; }
    else if (won === false) user.gamblingStats.totalLost += bet;
    await user.save();

    const embed = new EmbedBuilder()
      .setColor(won === true ? config.colors.success : won === false ? config.colors.error : config.colors.warning)
      .setTitle('🎲 Cosmic Dice Roll')
      .setDescription(resultText)
      .addFields(
        { name: '🎲 Your Roll', value: `${diceFaces[playerRoll]} **${playerRoll}**`, inline: true },
        { name: '🤖 Galaxy Roll', value: `${diceFaces[botRoll]} **${botRoll}**`, inline: true },
        { name: change > 0 ? '💰 Won' : change < 0 ? '💸 Lost' : '🤝 Result', value: change !== 0 ? `☄️ **${Math.abs(change).toLocaleString()}** Credits` : 'No change', inline: true },
        { name: '👛 Balance', value: `☄️ **${user.wallet.toLocaleString()}** Credits`, inline: true },
      )
      .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};