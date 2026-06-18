const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('./database');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('give')
    .setDescription('🤝 Give Cosmic Credits to another space traveler')
    .addUserOption(opt => opt.setName('user').setDescription('The user to give credits to').setRequired(true))
    .addIntegerOption(opt => opt.setName('amount').setDescription('Amount of credits to give').setRequired(true).setMinValue(1)),
  cooldown: 5,
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    if (target.id === interaction.user.id)
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Invalid Target').setDescription("You can't give credits to yourself!").setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });
    if (target.bot)
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Invalid Target').setDescription("Robots don't need credits!").setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    const sender = await getUser(interaction.user.id);
    if (sender.wallet < amount)
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Insufficient Funds').setDescription(`You only have ☄️ **${sender.wallet.toLocaleString()}** Credits in your wallet.`).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    const receiver = await getUser(target.id);
    sender.wallet -= amount;
    receiver.wallet += amount;
    await sender.save();
    await receiver.save();

    const embed = new EmbedBuilder()
      .setColor(config.colors.success)
      .setTitle('🤝 Credits Transferred!')
      .setDescription(`**${interaction.user.username}** sent credits across the galaxy to **${target.username}**!`)
      .addFields(
        { name: '💸 Sent', value: `☄️ **${amount.toLocaleString()}** Credits`, inline: true },
        { name: '👛 Your Balance', value: `☄️ **${sender.wallet.toLocaleString()}** Credits`, inline: true },
      )
      .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};