const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('🔓 Unban a user from the galaxy')
    .addStringOption(opt => opt.setName('userid').setDescription('User ID to unban').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for unban').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  cooldown: 3,
  async execute(interaction) {
    const userId = interaction.options.getString('userid');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      await interaction.guild.members.unban(userId, reason);
      await interaction.reply({
        embeds: [new EmbedBuilder().setColor(config.colors.success).setTitle('🔓 User Unbanned')
          .addFields({ name: '👤 User ID', value: userId, inline: true }, { name: '🛡️ Moderator', value: interaction.user.tag, inline: true }, { name: '📝 Reason', value: reason })
          .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()],
      });
    } catch {
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Unban Failed').setDescription('User not found in ban list.').setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });
    }
  },
};