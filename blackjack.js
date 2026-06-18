const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { getUser } = require('./database');
const config = require('./config');const SUITS = ['♠️', '♥️', '♦️', '♣️'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function buildDeck() {
  const deck = [];
  for (const s of SUITS) for (const v of VALUES) deck.push({ suit: s, value: v });
  return deck.sort(() => Math.random() - 0.5);
}

function cardValue(card) {
  if (['J', 'Q', 'K'].includes(card.value)) return 10;
  if (card.value === 'A') return 11;
  return parseInt(card.value);
}

function handValue(hand) {
  let val = hand.reduce((a, c) => a + cardValue(c), 0);
  let aces = hand.filter(c => c.value === 'A').length;
  while (val > 21 && aces > 0) { val -= 10; aces--; }
  return val;
}

function formatHand(hand) {
  return hand.map(c => `${c.value}${c.suit}`).join(' ');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blackjack')
    .setDescription('🃏 Play Galactic Blackjack')
    .addIntegerOption(opt => opt.setName('bet').setDescription('Amount to bet').setRequired(true).setMinValue(10)),
  cooldown: 5,
  async execute(interaction) {
    const bet = interaction.options.getInteger('bet');
    const user = await getUser(interaction.user.id);

    if (user.wallet < bet)
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Insufficient Funds').setDescription(`You only have ☄️ **${user.wallet.toLocaleString()}** Credits.`).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    const deck = buildDeck();
    const playerHand = [deck.pop(), deck.pop()];
    const dealerHand = [deck.pop(), deck.pop()];

    const buildEmbed = (showDealer = false, status = null) => {
      const pv = handValue(playerHand);
      const dv = handValue(dealerHand);
      let color = config.colors.secondary;
      if (status === 'win') color = config.colors.success;
      else if (status === 'lose') color = config.colors.error;
      else if (status === 'push') color = config.colors.warning;

      return new EmbedBuilder()
        .setColor(color)
        .setTitle('🃏 Galactic Blackjack')
        .addFields(
          { name: '🎴 Your Hand', value: `${formatHand(playerHand)}\n**Value: ${pv}**`, inline: true },
          { name: '🤖 Dealer Hand', value: showDealer ? `${formatHand(dealerHand)}\n**Value: ${dv}**` : `${dealerHand[0].value}${dealerHand[0].suit} 🂠\n**Value: ?**`, inline: true },
          { name: '💰 Bet', value: `☄️ **${bet.toLocaleString()}** Credits`, inline: true },
        )
        .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp();
    };

    // Check instant blackjack
    if (handValue(playerHand) === 21) {
      const winnings = Math.floor(bet * 1.5);
      user.wallet += winnings;
      user.gamblingStats.gamesPlayed++;
      user.gamblingStats.totalWon += winnings;
      if (winnings > user.gamblingStats.biggestWin) user.gamblingStats.biggestWin = winnings;
      await user.save();
      const e = buildEmbed(true, 'win');
      e.setTitle('🃏 Blackjack! Natural 21!').addFields({ name: '💰 Won', value: `☄️ **${winnings.toLocaleString()}** Credits (1.5x)`, inline: true });
      return interaction.reply({ embeds: [e] });
    }

    const hitBtn = new ButtonBuilder().setCustomId('bj_hit').setLabel('Hit ➕').setStyle(ButtonStyle.Primary);
    const standBtn = new ButtonBuilder().setCustomId('bj_stand').setLabel('Stand ✋').setStyle(ButtonStyle.Secondary);
    const row = new ActionRowBuilder().addComponents(hitBtn, standBtn);

    const msg = await interaction.reply({ embeds: [buildEmbed()], components: [row], fetchReply: true });

    const collector = msg.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: 60000 });

    collector.on('collect', async i => {
      if (i.customId === 'bj_hit') {
        playerHand.push(deck.pop());
        const pv = handValue(playerHand);
        if (pv > 21) {
          collector.stop('bust');
          user.wallet -= bet;
          user.gamblingStats.gamesPlayed++;
          user.gamblingStats.totalLost += bet;
          await user.save();
          const e = buildEmbed(true, 'lose');
          e.setTitle('🃏 Bust! Over 21!').addFields({ name: '💸 Lost', value: `☄️ **${bet.toLocaleString()}** Credits`, inline: true }, { name: '👛 Balance', value: `☄️ **${user.wallet.toLocaleString()}** Credits`, inline: true });
          await i.update({ embeds: [e], components: [] });
        } else if (pv === 21) {
          collector.stop('stand');
          await i.update({ embeds: [buildEmbed()], components: [] });
        } else {
          await i.update({ embeds: [buildEmbed()], components: [row] });
        }
      } else if (i.customId === 'bj_stand') {
        collector.stop('stand');
        // Dealer plays
        while (handValue(dealerHand) < 17) dealerHand.push(deck.pop());
        const pv = handValue(playerHand), dv = handValue(dealerHand);
        let status, change, title;
        if (dv > 21 || pv > dv) { status = 'win'; change = bet; title = '🎉 You Win! The dealer busted!' ; }
        else if (pv < dv) { status = 'lose'; change = -bet; title = '💫 Dealer Wins!'; }
        else { status = 'push'; change = 0; title = '🤝 Push — It\'s a tie!'; }
        user.wallet += change;
        user.gamblingStats.gamesPlayed++;
        if (change > 0) { user.gamblingStats.totalWon += change; if (change > user.gamblingStats.biggestWin) user.gamblingStats.biggestWin = change; }
        else if (change < 0) user.gamblingStats.totalLost += Math.abs(change);
        await user.save();
        const e = buildEmbed(true, status);
        e.setTitle(`🃏 ${title}`).addFields(
          { name: change > 0 ? '💰 Won' : change < 0 ? '💸 Lost' : '🤝 Push', value: change !== 0 ? `☄️ **${Math.abs(change).toLocaleString()}** Credits` : 'No change', inline: true },
          { name: '👛 Balance', value: `☄️ **${user.wallet.toLocaleString()}** Credits`, inline: true },
        );
        await i.update({ embeds: [e], components: [] });
      }
    });

    collector.on('end', async (_, reason) => {
      if (reason === 'time') {
        await msg.edit({ components: [] }).catch(() => {});
      }
    });
  },
};