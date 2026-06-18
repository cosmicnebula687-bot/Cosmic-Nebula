const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getUser } = require('./database');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-money')
    .setDescription('💰 Set a user\'s Cosmic Credits to a specific amount')
    .addUserOption(opt => opt.setName('user').setDescription('User to set').setRequired(true))
    .addIntegerOption(opt => opt.setName('amount').setDescription('Amount to set').setRequired(true).setMinValue(0))
    .addStringOption(opt => opt.setName('location').setDescription('Wallet or bank').addChoices({ name: 'Wallet', value: 'wallet' }, { name: 'Bank', value: 'bank' }).setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  cooldown: 3,
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');
    const location = interaction.options.getString('location') || 'wallet';
    const user = await getUser(target.id);

    user[location] = amount;
    await user.save();

    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(config.colors.secondary).setTitle('💰 Credits Set')
        .addFields({ name: '👤 User', value: target.tag, inline: true }, { name: '💰 Set To', value: `☄️ **${amount.toLocaleString()}** in ${location}`, inline: true })
        .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()],
    });
  },
};