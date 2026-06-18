const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { getUser } = require('./database');
const config = require('./config');
const CHOICES = {
  rocket: { emoji: '🚀', beats: 'asteroid', losesTo: 'shield' },
  asteroid: { emoji: '☄️', beats: 'shield', losesTo: 'rocket' },
  shield: { emoji: '🛡️', beats: 'rocket', losesTo: 'asteroid' },
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rps')
    .setDescription('🚀 Rocket, Asteroid, Shield — Space RPS!')
    .addIntegerOption(opt => opt.setName('bet').setDescription('Amount to bet').setRequired(true).setMinValue(10)),
  cooldown: 3,
  async execute(interaction) {
    const bet = interaction.options.getInteger('bet');
    const user = await getUser(interaction.user.id);

    if (user.wallet < bet)
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Insufficient Funds').setDescription(`You only have ☄️ **${user.wallet.toLocaleString()}** Credits.`).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('rps_rocket').setLabel('🚀 Rocket').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('rps_asteroid').setLabel('☄️ Asteroid').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('rps_shield').setLabel('🛡️ Shield').setStyle(ButtonStyle.Secondary),
    );

    const msg = await interaction.reply({
      embeds: [new EmbedBuilder().setColor(config.colors.secondary).setTitle('🚀 Cosmic RPS — Choose Your Weapon!').setDescription('Rocket beats Asteroid\nAsteroid beats Shield\nShield beats Rocket').addFields({ name: '💰 Bet', value: `☄️ **${bet.toLocaleString()}** Credits`, inline: true }).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()],
      components: [row], fetchReply: true,
    });

    const collector = msg.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: 30000 });
    collector.on('collect', async i => {
      collector.stop();
      const playerChoice = i.customId.split('_')[1];
      const botChoiceKey = Object.keys(CHOICES)[Math.floor(Math.random() * 3)];
      const pc = CHOICES[playerChoice], bc = CHOICES[botChoiceKey];

      let won, change, title;
      if (playerChoice === botChoiceKey) { won = null; change = 0; title = '🤝 Cosmic Tie!'; }
      else if (pc.beats === botChoiceKey) { won = true; change = bet; title = '🎉 You Win!'; }
      else { won = false; change = -bet; title = '💫 Galaxy Wins!'; }

      user.wallet += change;
      user.gamblingStats.gamesPlayed++;
      if (change > 0) { user.gamblingStats.totalWon += change; if (change > user.gamblingStats.biggestWin) user.gamblingStats.biggestWin = change; }
      else if (change < 0) user.gamblingStats.totalLost += Math.abs(change);
      await user.save();

      const e = new EmbedBuilder()
        .setColor(won === true ? config.colors.success : won === false ? config.colors.error : config.colors.warning)
        .setTitle(`🚀 ${title}`)
        .addFields(
          { name: '🎮 You', value: `${pc.emoji} ${playerChoice.charAt(0).toUpperCase() + playerChoice.slice(1)}`, inline: true },
          { name: '🤖 Galaxy', value: `${bc.emoji} ${botChoiceKey.charAt(0).toUpperCase() + botChoiceKey.slice(1)}`, inline: true },
          { name: change > 0 ? '💰 Won' : change < 0 ? '💸 Lost' : '🤝 Tie', value: change !== 0 ? `☄️ **${Math.abs(change).toLocaleString()}** Credits` : 'No change', inline: true },
          { name: '👛 Balance', value: `☄️ **${user.wallet.toLocaleString()}** Credits`, inline: true },
        )
        .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp();
      await i.update({ embeds: [e], components: [] });
    });
    collector.on('end', async (_, reason) => { if (reason === 'time') await msg.edit({ components: [] }).catch(() => {}); });
  },
};