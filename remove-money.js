const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getUser } = require('./database');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove-money')
    .setDescription('➖ Remove Cosmic Credits from a user')
    .addUserOption(opt => opt.setName('user').setDescription('User to remove credits from').setRequired(true))
    .addIntegerOption(opt => opt.setName('amount').setDescription('Amount to remove').setRequired(true).setMinValue(1))
    .addStringOption(opt => opt.setName('location').setDescription('Wallet or bank').addChoices({ name: 'Wallet', value: 'wallet' }, { name: 'Bank', value: 'bank' }).setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  cooldown: 3,
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');
    const location = interaction.options.getString('location') || 'wallet';
    const user = await getUser(target.id);

    user[location] = Math.max(0, user[location] - amount);
    await user.save();

    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(config.colors.warning).setTitle('➖ Credits Removed')
        .addFields({ name: '👤 User', value: target.tag, inline: true }, { name: '💸 Removed', value: `☄️ **${amount.toLocaleString()}** from ${location}`, inline: true }, { name: '💼 New Balance', value: `Wallet: ${user.wallet.toLocaleString()} | Bank: ${user.bank.toLocaleString()}`, inline: false })
        .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()],
    });
  },
};