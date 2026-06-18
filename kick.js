const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('👢 Kick a member from the galaxy')
    .addUserOption(opt => opt.setName('user').setDescription('User to kick').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  cooldown: 3,
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    if (!member) return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Member Not Found').setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });
    if (!member.kickable) return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Cannot Kick').setDescription('I cannot kick this member.').setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    await member.kick(reason);
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(config.colors.warning).setTitle('👢 User Kicked')
        .addFields({ name: '👤 User', value: `${target.tag}`, inline: true }, { name: '🛡️ Moderator', value: interaction.user.tag, inline: true }, { name: '📝 Reason', value: reason })
        .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()],
    });
  },
};