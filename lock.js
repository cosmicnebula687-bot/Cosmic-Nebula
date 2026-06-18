const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('🔒 Lock a channel')
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for locking').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  cooldown: 3,
  async execute(interaction) {
    const reason = interaction.options.getString('reason') || 'Channel locked by moderator';
    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('🔒 Channel Locked')
        .setDescription(`This channel has been locked.\n📝 **Reason:** ${reason}`)
        .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()],
    });
  },
};