const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('🔊 Unmute a member (remove timeout)')
    .addUserOption(opt => opt.setName('user').setDescription('User to unmute').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  cooldown: 3,
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Member Not Found').setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    await member.timeout(null);
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(config.colors.success).setTitle('🔊 Member Unmuted')
        .addFields({ name: '👤 User', value: target.tag, inline: true }, { name: '🛡️ Moderator', value: interaction.user.tag, inline: true })
        .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()],
    });
  },
};