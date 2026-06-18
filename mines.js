const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { getUser } = require('./database');
const config = require('./config');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('mines')
    .setDescription('💣 Navigate a minefield for cosmic rewards')
    .addIntegerOption(opt => opt.setName('bet').setDescription('Amount to bet').setRequired(true).setMinValue(10))
    .addIntegerOption(opt => opt.setName('mines').setDescription('Number of mines (1-10)').setRequired(false).setMinValue(1).setMaxValue(10)),
  cooldown: 5,
  async execute(interaction) {
    const bet = interaction.options.getInteger('bet');
    const mineCount = interaction.options.getInteger('mines') || 3;
    const user = await getUser(interaction.user.id);

    if (user.wallet < bet)
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Insufficient Funds').setDescription(`You only have ☄️ **${user.wallet.toLocaleString()}** Credits.`).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    // 5x5 grid
    const GRID_SIZE = 25;
    const mines = new Set();
    while (mines.size < mineCount) mines.add(Math.floor(Math.random() * GRID_SIZE));

    const revealed = new Set();
    let multiplier = 1.0;
    let gameOver = false;

    const buildRows = (showAll = false) => {
      const rows = [];
      for (let r = 0; r < 5; r++) {
        const row = new ActionRowBuilder();
        for (let c = 0; c < 5; c++) {
          const idx = r * 5 + c;
          const isMine = mines.has(idx);
          const isRevealed = revealed.has(idx);
          let btn;
          if (isRevealed || (showAll && isMine)) {
            btn = new ButtonBuilder().setCustomId(`m_${idx}`).setLabel(isMine ? '💣' : '⭐').setStyle(isMine ? ButtonStyle.Danger : ButtonStyle.Success).setDisabled(true);
          } else {
            btn = new ButtonBuilder().setCustomId(`m_${idx}`).setLabel('🔲').setStyle(ButtonStyle.Secondary).setDisabled(gameOver);
          }
          row.addComponents(btn);
        }
        rows.push(row);
      }
      // Cash out row
      const cashRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('m_cashout').setLabel(`💰 Cash Out (${multiplier.toFixed(2)}x)`).setStyle(ButtonStyle.Primary).setDisabled(gameOver || revealed.size === 0),
      );
      rows.push(cashRow);
      return rows;
    };

    const buildEmbed = (status = 'playing') => new EmbedBuilder()
      .setColor(status === 'win' ? config.colors.success : status === 'lose' ? config.colors.error : config.colors.secondary)
      .setTitle('💣 Galactic Mines')
      .setDescription(`${mineCount} mines hidden in the field!\nReveal safe tiles for multipliers.`)
      .addFields(
        { name: '💰 Bet', value: `☄️ **${bet.toLocaleString()}** Credits`, inline: true },
        { name: '📈 Multiplier', value: `**${multiplier.toFixed(2)}x**`, inline: true },
        { name: '✅ Safe Tiles', value: `**${revealed.size}**`, inline: true },
      )
      .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp();

    const msg = await interaction.reply({ embeds: [buildEmbed()], components: buildRows(), fetchReply: true });
    const collector = msg.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: 120000 });

    collector.on('collect', async i => {
      if (i.customId === 'm_cashout') {
        collector.stop('cashout');
        gameOver = true;
        const winnings = Math.floor(bet * multiplier);
        user.wallet += winnings - bet;
        user.gamblingStats.gamesPlayed++;
        user.gamblingStats.totalWon += winnings;
        if (winnings > user.gamblingStats.biggestWin) user.gamblingStats.biggestWin = winnings;
        await user.save();
        const e = buildEmbed('win');
        e.setTitle('💰 Mines — Cashed Out!').addFields({ name: '💰 Won', value: `☄️ **${winnings.toLocaleString()}** Credits`, inline: true }, { name: '👛 Balance', value: `☄️ **${user.wallet.toLocaleString()}** Credits`, inline: true });
        await i.update({ embeds: [e], components: buildRows(true) });
        return;
      }
      const idx = parseInt(i.customId.split('_')[1]);
      if (mines.has(idx)) {
        gameOver = true;
        collector.stop('mine');
        user.wallet -= bet;
        user.gamblingStats.gamesPlayed++;
        user.gamblingStats.totalLost += bet;
        await user.save();
        revealed.add(idx);
        const e = buildEmbed('lose');
        e.setTitle('💥 Mine Hit! Game Over!').addFields({ name: '💸 Lost', value: `☄️ **${bet.toLocaleString()}** Credits`, inline: true }, { name: '👛 Balance', value: `☄️ **${user.wallet.toLocaleString()}** Credits`, inline: true });
        await i.update({ embeds: [e], components: buildRows(true) });
      } else {
        revealed.add(idx);
        multiplier = parseFloat((multiplier + (mineCount * 0.1)).toFixed(2));
        await i.update({ embeds: [buildEmbed()], components: buildRows() });
      }
    });

    collector.on('end', async (_, reason) => {
      if (reason === 'time') await msg.edit({ components: [] }).catch(() => {});
    });
  },
};