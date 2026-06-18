const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { getUser } = require('./database');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('crash')
    .setDescription('🚀 Launch a rocket — cash out before it crashes!')
    .addIntegerOption(opt => opt.setName('bet').setDescription('Amount to bet').setRequired(true).setMinValue(10)),
  cooldown: 5,
  async execute(interaction) {
    const bet = interaction.options.getInteger('bet');
    const user = await getUser(interaction.user.id);

    if (user.wallet < bet)
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Insufficient Funds').setDescription(`You only have ☄️ **${user.wallet.toLocaleString()}** Credits.`).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    // Generate crash point: exponential distribution
    const crashPoint = parseFloat((Math.random() < 0.33 ? (Math.random() * 1.5 + 1) : (Math.random() * 8 + 1.5)).toFixed(2));
    let currentMultiplier = 1.0;
    let crashed = false;

    const cashOutBtn = new ButtonBuilder().setCustomId('crash_out').setLabel('🚀 Cash Out').setStyle(ButtonStyle.Success);
    const row = new ActionRowBuilder().addComponents(cashOutBtn);

    const buildEmbed = (mult, done = false, won = false) => new EmbedBuilder()
      .setColor(done ? (won ? config.colors.success : config.colors.error) : config.colors.secondary)
      .setTitle(done ? (won ? '💰 Cashed Out!' : '💥 CRASHED!') : '🚀 Rocket in Flight...')
      .setDescription(done
        ? (won ? `You bailed at **${mult.toFixed(2)}x** — smart!` : `💥 The rocket crashed at **${crashPoint.toFixed(2)}x** — you held too long!`)
        : `The rocket is flying!\nCurrent: **${mult.toFixed(2)}x** | Crash at: **??**`)
      .addFields(
        { name: '💰 Bet', value: `☄️ **${bet.toLocaleString()}** Credits`, inline: true },
        { name: done ? '💸 Result' : '📈 Current Win', value: `☄️ **${Math.floor(bet * mult).toLocaleString()}** Credits`, inline: true },
      )
      .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp();

    const msg = await interaction.reply({ embeds: [buildEmbed(currentMultiplier)], components: [row], fetchReply: true });
    const collector = msg.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: 30000 });

    // Auto-crash timer
    const interval = setInterval(async () => {
      currentMultiplier = parseFloat((currentMultiplier + 0.25).toFixed(2));
      if (currentMultiplier >= crashPoint) {
        clearInterval(interval);
        if (!crashed) {
          crashed = true;
          collector.stop('crash');
          user.wallet -= bet;
          user.gamblingStats.gamesPlayed++;
          user.gamblingStats.totalLost += bet;
          await user.save();
          await msg.edit({ embeds: [buildEmbed(crashPoint, true, false)], components: [] }).catch(() => {});
        }
      } else {
        await msg.edit({ embeds: [buildEmbed(currentMultiplier)], components: [row] }).catch(() => {});
      }
    }, 1500);

    collector.on('collect', async i => {
      if (!crashed && i.customId === 'crash_out') {
        clearInterval(interval);
        crashed = true;
        collector.stop('cashout');
        const winnings = Math.floor(bet * currentMultiplier);
        user.wallet += winnings - bet;
        user.gamblingStats.gamesPlayed++;
        user.gamblingStats.totalWon += winnings;
        if (winnings > user.gamblingStats.biggestWin) user.gamblingStats.biggestWin = winnings;
        await user.save();
        const e = buildEmbed(currentMultiplier, true, true);
        e.addFields({ name: '👛 Balance', value: `☄️ **${user.wallet.toLocaleString()}** Credits`, inline: true });
        await i.update({ embeds: [e], components: [] });
      }
    });

    collector.on('end', () => clearInterval(interval));
  },
};