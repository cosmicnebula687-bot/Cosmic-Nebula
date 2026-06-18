const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('🔓 Unlock a channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  cooldown: 3,
  async execute(interaction) {
    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: null });
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(config.colors.success).setTitle('🔓 Channel Unlocked')
        .setDescription('This channel has been unlocked.')
        .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()],
    });
  },
};