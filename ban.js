const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('🔨 Ban a member from the galaxy')
    .addUserOption(opt => opt.setName('user').setDescription('User to ban').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for ban').setRequired(false))
    .addIntegerOption(opt => opt.setName('days').setDescription('Days of messages to delete (0-7)').setMinValue(0).setMaxValue(7).setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  cooldown: 3,
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const days = interaction.options.getInteger('days') || 0;

    if (target.id === interaction.user.id)
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Cannot Ban Yourself').setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (member && !member.bannable)
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Cannot Ban This User').setDescription('My role is not high enough to ban this member.').setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    try {
      await interaction.guild.members.ban(target.id, { reason, deleteMessageSeconds: days * 86400 });
      const embed = new EmbedBuilder()
        .setColor(config.colors.error)
        .setTitle('🔨 User Banned')
        .setThumbnail(target.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: '👤 User', value: `${target.tag} (${target.id})`, inline: true },
          { name: '🛡️ Moderator', value: interaction.user.tag, inline: true },
          { name: '📝 Reason', value: reason, inline: false },
        )
        .setFooter({ text: '🌌 Nebula Bot • Moderation' }).setTimestamp();
      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Ban Failed').setDescription(err.message).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });
    }
  },
};