const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('./database');
const config = require('./config');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('withdraw')
    .setDescription('👛 Withdraw Cosmic Credits from your Galaxy Bank')
    .addStringOption(opt => opt.setName('amount').setDescription('Amount to withdraw (or "all")').setRequired(true)),
  cooldown: 3,
  async execute(interaction) {
    const user = await getUser(interaction.user.id);
    const input = interaction.options.getString('amount').toLowerCase();
    let amount = input === 'all' ? user.bank : parseInt(input);

    if (isNaN(amount) || amount <= 0)
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Invalid Amount').setDescription('Please enter a valid positive number or "all".').setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });
    if (amount > user.bank)
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Insufficient Bank Funds').setDescription(`You only have ☄️ **${user.bank.toLocaleString()}** Credits in your bank.`).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    user.bank -= amount;
    user.wallet += amount;
    await user.save();

    const embed = new EmbedBuilder()
      .setColor(config.colors.success)
      .setTitle('👛 Withdrawal Successful!')
      .addFields(
        { name: '💸 Withdrawn', value: `☄️ **${amount.toLocaleString()}** Credits`, inline: true },
        { name: '👛 Wallet', value: `☄️ **${user.wallet.toLocaleString()}** Credits`, inline: true },
        { name: '🏦 Bank', value: `☄️ **${user.bank.toLocaleString()}** Credits`, inline: true },
      )
      .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};