const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('./database');
const { formatTime, randomInt } = require('./embed');
const config = require('../../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('🚀 Take on a space job and earn Cosmic Credits'),
  cooldown: 3,
  async execute(interaction) {
    const user = await getUser(interaction.user.id);
    const now = Date.now();
    const cooldown = config.economy.workCooldown;

    if (user.workCooldown && now - user.workCooldown < cooldown) {
      const remaining = cooldown - (now - user.workCooldown);
      const embed = new EmbedBuilder()
        .setColor(config.colors.warning)
        .setTitle('⏳ Still Working')
        .setDescription(`You're still on a mission! Rest in **${formatTime(remaining)}**.`)
        .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp();
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const job = config.jobs[Math.floor(Math.random() * config.jobs.length)];
    const earned = randomInt(job.min, job.max);

    user.wallet += earned;
    user.workCooldown = now;
    user.xp += randomInt(5, 15);
    await user.save();

    const workMessages = [
      `You successfully completed the mission!`,
      `Another job well done in the cosmos!`,
      `The galaxy thanks you for your service!`,
      `Mission accomplished, space traveler!`,
    ];

    const embed = new EmbedBuilder()
      .setColor(config.colors.secondary)
      .setTitle(`${job.emoji} Space Job Complete!`)
      .setDescription(`**${job.name}**\n\n${workMessages[Math.floor(Math.random() * workMessages.length)]}`)
      .addFields(
        { name: '💰 Earned', value: `☄️ **${earned.toLocaleString()}** Credits`, inline: true },
        { name: '👛 New Balance', value: `☄️ **${user.wallet.toLocaleString()}** Credits`, inline: true },
        { name: '⏳ Next Job', value: `In **${formatTime(cooldown)}**`, inline: true },
      )
      .setFooter({ text: '🌌 Nebula Bot • Keep working to level up!' }).setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};