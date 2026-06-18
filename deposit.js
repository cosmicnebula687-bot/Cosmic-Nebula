const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('./database');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deposit')
    .setDescription('🏦 Deposit Cosmic Credits into your Galaxy Bank')
    .addStringOption(opt => opt.setName('amount').setDescription('Amount to deposit (or "all")').setRequired(true)),
  cooldown: 3,
  async execute(interaction) {
    const user = await getUser(interaction.user.id);
    const input = interaction.options.getString('amount').toLowerCase();
    let amount = input === 'all' ? user.wallet : parseInt(input);

    if (isNaN(amount) || amount <= 0)
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Invalid Amount').setDescription('Please enter a valid positive number or "all".').setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });
    if (amount > user.wallet)
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Insufficient Funds').setDescription(`You only have ☄️ **${user.wallet.toLocaleString()}** Credits in your wallet.`).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    user.wallet -= amount;
    user.bank += amount;
    await user.save();

    const embed = new EmbedBuilder()
      .setColor(config.colors.success)
      .setTitle('🏦 Deposit Successful!')
      .setDescription(`You safely stowed your credits in the Galaxy Bank.`)
      .addFields(
        { name: '💸 Deposited', value: `☄️ **${amount.toLocaleString()}** Credits`, inline: true },
        { name: '👛 Wallet', value: `☄️ **${user.wallet.toLocaleString()}** Credits`, inline: true },
        { name: '🏦 Bank', value: `☄️ **${user.bank.toLocaleString()}** Credits`, inline: true },
      )
      .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};