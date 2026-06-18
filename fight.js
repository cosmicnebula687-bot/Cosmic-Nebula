const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('./database');
const { randomInt } = require('./embed');
const config = require('./config');

const moves = ['🚀 Rocket Punch', '⚡ Plasma Blast', '🌌 Void Strike', '☄️ Meteor Throw', '🛡️ Nebula Shield Break'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fight')
    .setDescription('🥊 Pick a fight with another traveler for XP and reputation')
    .addUserOption(opt => opt.setName('user').setDescription('User to fight').setRequired(true)),
  cooldown: 30,
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    if (target.id === interaction.user.id || target.bot)
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Invalid Target').setDescription("Pick a real opponent!").setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    const attacker = await getUser(interaction.user.id);
    const defender = await getUser(target.id);

    let aHP = 100 + attacker.level * 5, dHP = 100 + defender.level * 5;
    const log = [];

    for (let r = 0; r < 8 && aHP > 0 && dHP > 0; r++) {
      const aDmg = randomInt(8, 25);
      const dDmg = randomInt(8, 25);
      const aMove = moves[Math.floor(Math.random() * moves.length)];
      const dMove = moves[Math.floor(Math.random() * moves.length)];
      dHP -= aDmg; aHP -= dDmg;
      log.push(`**R${r+1}:** ${aMove} (-${aDmg} HP) | ${dMove} (-${dDmg} HP)`);
    }

    const attackerWon = aHP >= dHP;
    const winner = attackerWon ? attacker : defender;
    const loser = attackerWon ? defender : attacker;
    const winnerUser = attackerWon ? interaction.user : target;

    winner.xp += randomInt(20, 50);
    winner.reputation += 1;
    loser.reputation = Math.max(0, loser.reputation - 1);
    await winner.save(); await loser.save();

    const embed = new EmbedBuilder()
      .setColor(config.colors.nebula)
      .setTitle('🥊 Cosmic Street Fight!')
      .setDescription(log.slice(-4).join('\n'))
      .addFields(
        { name: '🏆 Winner', value: winnerUser.username, inline: true },
        { name: '✨ XP Gained', value: `+${randomInt(20, 50)} XP`, inline: true },
        { name: '⭐ Rep', value: `${winnerUser.username} +1 Rep`, inline: true },
      )
      .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};