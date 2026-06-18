const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { getUser } = require('./database');
const config = require('./config');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('higherlower')
    .setDescription('📊 Guess if the next number is higher or lower')
    .addIntegerOption(opt => opt.setName('bet').setDescription('Amount to bet').setRequired(true).setMinValue(10)),
  cooldown: 5,
  async execute(interaction) {
    const bet = interaction.options.getInteger('bet');
    const user = await getUser(interaction.user.id);

    if (user.wallet < bet)
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Insufficient Funds').setDescription(`You only have ☄️ **${user.wallet.toLocaleString()}** Credits.`).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    let current = Math.floor(Math.random() * 100) + 1;
    let multiplier = 1;
    let round = 1;

    const buildEmbed = () => new EmbedBuilder()
      .setColor(config.colors.secondary)
      .setTitle('📊 Higher or Lower — Nebula Edition')
      .setDescription(`Round **${round}** — Current number: **${current}**\nIs the next number higher or lower?`)
      .addFields(
        { name: '💰 Bet', value: `☄️ **${bet.toLocaleString()}** Credits`, inline: true },
        { name: '📈 Current Multiplier', value: `**${multiplier.toFixed(1)}x**`, inline: true },
      )
      .setFooter({ text: '🌌 Nebula Bot • Max 5 rounds' }).setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('hl_higher').setLabel('Higher ⬆️').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('hl_lower').setLabel('Lower ⬇️').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('hl_cashout').setLabel('Cash Out 💰').setStyle(ButtonStyle.Success),
    );

    const msg = await interaction.reply({ embeds: [buildEmbed()], components: [row], fetchReply: true });
    const collector = msg.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: 60000 });

    collector.on('collect', async i => {
      if (i.customId === 'hl_cashout') {
        collector.stop('cashout');
        const winnings = Math.floor(bet * multiplier);
        user.wallet += winnings - bet;
        user.gamblingStats.gamesPlayed++;
        user.gamblingStats.totalWon += winnings;
        await user.save();
        const e = new EmbedBuilder().setColor(config.colors.success).setTitle('💰 Cashed Out!').setDescription(`Smart move, space traveler!`)
          .addFields({ name: '💰 Won', value: `☄️ **${winnings.toLocaleString()}** Credits`, inline: true }, { name: '👛 Balance', value: `☄️ **${user.wallet.toLocaleString()}** Credits`, inline: true });
        await i.update({ embeds: [e], components: [] });
        return;
      }
      const next = Math.floor(Math.random() * 100) + 1;
      const correct = (i.customId === 'hl_higher' && next > current) || (i.customId === 'hl_lower' && next < current);
      current = next;
      round++;
      if (!correct) {
        collector.stop('wrong');
        user.wallet -= bet;
        user.gamblingStats.gamesPlayed++;
        user.gamblingStats.totalLost += bet;
        await user.save();
        const e = new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Wrong Guess!').setDescription(`The number was **${next}**. Bad luck, space traveler!`)
          .addFields({ name: '💸 Lost', value: `☄️ **${bet.toLocaleString()}** Credits`, inline: true }, { name: '👛 Balance', value: `☄️ **${user.wallet.toLocaleString()}** Credits`, inline: true });
        await i.update({ embeds: [e], components: [] });
      } else {
        multiplier = Math.min(multiplier + 0.5, 5);
        if (round > 5) {
          collector.stop('max');
          const winnings = Math.floor(bet * multiplier);
          user.wallet += winnings - bet;
          user.gamblingStats.gamesPlayed++;
          user.gamblingStats.totalWon += winnings;
          if (winnings > user.gamblingStats.biggestWin) user.gamblingStats.biggestWin = winnings;
          await user.save();
          const e = new EmbedBuilder().setColor(config.colors.gold).setTitle('🏆 Max Rounds Reached!').setDescription('You reached the limit — maximum payout!')
            .addFields({ name: '💰 Won', value: `☄️ **${winnings.toLocaleString()}** Credits`, inline: true }, { name: '👛 Balance', value: `☄️ **${user.wallet.toLocaleString()}** Credits`, inline: true });
          await i.update({ embeds: [e], components: [] });
        } else {
          await i.update({ embeds: [buildEmbed()], components: [row] });
        }
      }
    });

    collector.on('end', async (_, reason) => {
      if (reason === 'time') await msg.edit({ components: [] }).catch(() => {});
    });
  },
};