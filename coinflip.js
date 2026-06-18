const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { getUser } = require('./database');
const config = require('./config');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('🪙 Flip a cosmic coin and double your credits')
    .addIntegerOption(opt => opt.setName('bet').setDescription('Amount to bet').setRequired(true).setMinValue(10))
    .addStringOption(opt => opt.setName('side').setDescription('Heads or Tails').setRequired(true).addChoices({ name: '🌟 Heads', value: 'heads' }, { name: '☄️ Tails', value: 'tails' })),
  cooldown: 3,
  async execute(interaction) {
    const bet = interaction.options.getInteger('bet');
    const choice = interaction.options.getString('side');
    const user = await getUser(interaction.user.id);

    if (user.wallet < bet)
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Insufficient Funds').setDescription(`You only have ☄️ **${user.wallet.toLocaleString()}** Credits.`).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const won = result === choice;
    const change = won ? bet : -bet;

    user.wallet += change;
    user.gamblingStats.gamesPlayed++;
    if (won) { user.gamblingStats.totalWon += bet; if (bet > user.gamblingStats.biggestWin) user.gamblingStats.biggestWin = bet; }
    else user.gamblingStats.totalLost += bet;
    await user.save();

    const embed = new EmbedBuilder()
      .setColor(won ? config.colors.success : config.colors.error)
      .setTitle(won ? '🌟 Cosmic Flip — You Won!' : '☄️ Cosmic Flip — You Lost!')
      .setDescription(`The cosmic coin spins through the void...`)
      .addFields(
        { name: '🪙 Your Choice', value: choice === 'heads' ? '🌟 Heads' : '☄️ Tails', inline: true },
        { name: '🎲 Result', value: result === 'heads' ? '🌟 Heads' : '☄️ Tails', inline: true },
        { name: won ? '💰 Won' : '💸 Lost', value: `☄️ **${bet.toLocaleString()}** Credits`, inline: true },
        { name: '👛 New Balance', value: `☄️ **${user.wallet.toLocaleString()}** Credits`, inline: true },
      )
      .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};