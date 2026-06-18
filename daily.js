const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('./database');
const { formatTime, randomInt } = require('./embed');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('☄️ Claim your daily Cosmic Credits from the galaxy'),
  cooldown: 3,
  async execute(interaction) {
    const user = await getUser(interaction.user.id);
    const now = Date.now();
    const cooldown = config.economy.dailyCooldown;

    if (user.dailyCooldown && now - user.dailyCooldown < cooldown) {
      const remaining = cooldown - (now - user.dailyCooldown);
      const embed = new EmbedBuilder()
        .setColor(config.colors.warning)
        .setTitle('⏳ Daily Already Claimed')
        .setDescription(`The galaxy needs time to recharge!\nCome back in **${formatTime(remaining)}**.`)
        .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp();
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const streak = user.dailyStreak || 0;
    const amount = randomInt(config.economy.dailyMin, config.economy.dailyMax);
    const bonus = Math.floor(amount * (streak * 0.05));
    const total = amount + bonus;

    user.wallet += total;
    user.dailyCooldown = now;
    user.dailyStreak = streak + 1;
    await user.save();

    const embed = new EmbedBuilder()
      .setColor(config.colors.success)
      .setTitle('🌟 Daily Cosmic Credits Claimed!')
      .setDescription(`A meteor shower of credits has landed in your wallet!`)
      .addFields(
        { name: '☄️ Base Reward', value: `**${amount.toLocaleString()}** Credits`, inline: true },
        { name: '🔥 Streak Bonus', value: bonus > 0 ? `**+${bonus.toLocaleString()}** Credits` : '*None*', inline: true },
        { name: '💰 Total Received', value: `**${total.toLocaleString()}** Credits`, inline: true },
        { name: '🗓️ Day Streak', value: `**${user.dailyStreak}** days`, inline: true },
        { name: '👛 New Balance', value: `**${user.wallet.toLocaleString()}** Credits`, inline: true },
      )
      .setFooter({ text: '🌌 Nebula Bot • Come back in 24h!' }).setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};