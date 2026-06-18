const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('./database');
const { randomInt } = require('./embed');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('luck')
    .setDescription('🍀 Test your cosmic luck — free spin once per hour')
    .addIntegerOption(opt => opt.setName('bet').setDescription('Optional bet').setRequired(false).setMinValue(10)),
  cooldown: 3600,
  async execute(interaction) {
    const bet = interaction.options.getInteger('bet') || 0;
    const user = await getUser(interaction.user.id);

    if (bet > 0 && user.wallet < bet)
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Insufficient Funds').setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    const roll = Math.random();
    let outcome, reward, color;

    if (roll < 0.01) { outcome = '🌟 LEGENDARY LUCK! Cosmic jackpot!'; reward = randomInt(5000, 15000) + bet * 10; color = config.colors.gold; }
    else if (roll < 0.05) { outcome = '💎 Epic Fortune!'; reward = randomInt(2000, 5000) + bet * 5; color = 0x9B59B6; }
    else if (roll < 0.15) { outcome = '✨ Great Fortune!'; reward = randomInt(500, 2000) + bet * 2; color = config.colors.success; }
    else if (roll < 0.40) { outcome = '🌙 Minor Fortune'; reward = randomInt(100, 500) + bet; color = config.colors.secondary; }
    else if (roll < 0.65) { outcome = '💫 Break Even'; reward = bet; color = config.colors.warning; }
    else { outcome = '🌑 Bad Luck...'; reward = -Math.floor(bet * 0.5); color = config.colors.error; }

    user.wallet += reward;
    if (user.wallet < 0) user.wallet = 0;
    await user.save();

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle('🍀 Cosmic Luck Spin!')
      .setDescription(outcome)
      .addFields(
        { name: reward >= 0 ? '💰 Won' : '💸 Lost', value: `☄️ **${Math.abs(reward).toLocaleString()}** Credits`, inline: true },
        { name: '👛 Balance', value: `☄️ **${user.wallet.toLocaleString()}** Credits`, inline: true },
      )
      .setFooter({ text: '🌌 Nebula Bot • Try again in 1 hour!' }).setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};