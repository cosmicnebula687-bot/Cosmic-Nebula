const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { getUser } = require('./database');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('duel')
    .setDescription('⚔️ Challenge another space traveler to a cosmic duel')
    .addUserOption(opt => opt.setName('user').setDescription('The user to duel').setRequired(true))
    .addIntegerOption(opt => opt.setName('bet').setDescription('Credits to wager').setRequired(true).setMinValue(10)),
  cooldown: 10,
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const bet = interaction.options.getInteger('bet');

    if (target.id === interaction.user.id)
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Invalid Target').setDescription("You can't duel yourself!").setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });
    if (target.bot)
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Invalid Target').setDescription("Bots don't accept duels!").setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    const challenger = await getUser(interaction.user.id);
    if (challenger.wallet < bet)
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Insufficient Funds').setDescription(`You only have ☄️ **${challenger.wallet.toLocaleString()}** Credits.`).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('duel_accept').setLabel('⚔️ Accept Duel').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('duel_decline').setLabel('🏃 Flee').setStyle(ButtonStyle.Danger),
    );

    const embed = new EmbedBuilder()
      .setColor(config.colors.nebula)
      .setTitle('⚔️ Cosmic Duel Challenge!')
      .setDescription(`${interaction.user} has challenged ${target} to a galactic duel!\n\n${target}, do you accept?`)
      .addFields({ name: '💰 Wager', value: `☄️ **${bet.toLocaleString()}** Credits each`, inline: true })
      .setFooter({ text: '🌌 Nebula Bot • 60 seconds to respond' }).setTimestamp();

    const msg = await interaction.reply({ content: `${target}`, embeds: [embed], components: [row], fetchReply: true });
    const collector = msg.createMessageComponentCollector({ filter: i => i.user.id === target.id, time: 60000 });

    collector.on('collect', async i => {
      collector.stop();
      if (i.customId === 'duel_decline') {
        await i.update({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('🏃 Duel Declined!').setDescription(`${target.username} fled from the battle!`).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], components: [] });
        return;
      }

      const defender = await getUser(target.id);
      if (defender.wallet < bet) {
        await i.update({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Cannot Afford').setDescription(`${target.username} doesn't have enough credits!`).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], components: [] });
        return;
      }

      // Battle simulation
      let cHP = 100, dHP = 100;
      const rounds = [];
      for (let r = 0; r < 5 && cHP > 0 && dHP > 0; r++) {
        const cDmg = Math.floor(Math.random() * 30) + 10;
        const dDmg = Math.floor(Math.random() * 30) + 10;
        dHP -= cDmg;
        cHP -= dDmg;
        rounds.push(`Round ${r+1}: ${interaction.user.username} hits for **${cDmg}**, ${target.username} hits for **${dDmg}**`);
      }

      const challengerWon = cHP >= dHP;
      const winner = challengerWon ? interaction.user : target;
      const loser = challengerWon ? target : interaction.user;
      const winnerUser = challengerWon ? challenger : defender;
      const loserUser = challengerWon ? defender : challenger;

      winnerUser.wallet += bet;
      loserUser.wallet = Math.max(0, loserUser.wallet - bet);
      await winnerUser.save();
      await loserUser.save();

      const resultEmbed = new EmbedBuilder()
        .setColor(config.colors.gold)
        .setTitle('⚔️ Duel Results!')
        .setDescription(rounds.join('\n') + `\n\n🏆 **${winner.username}** wins the duel!`)
        .addFields(
          { name: '🏆 Winner', value: `${winner.username}`, inline: true },
          { name: '💰 Winnings', value: `☄️ **${bet.toLocaleString()}** Credits`, inline: true },
        )
        .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp();

      await i.update({ embeds: [resultEmbed], components: [] });
    });

    collector.on('end', async (_, reason) => {
      if (reason === 'time') await msg.edit({ components: [] }).catch(() => {});
    });
  },
};