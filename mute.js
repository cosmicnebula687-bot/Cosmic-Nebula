const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('🔇 Mute a member (timeout for 28 days or set duration)')
    .addUserOption(opt => opt.setName('user').setDescription('User to mute').setRequired(true))
    .addIntegerOption(opt => opt.setName('minutes').setDescription('Duration in minutes (default: 60)').setMinValue(1).setMaxValue(40320).setRequired(false))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  cooldown: 3,
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const minutes = interaction.options.getInteger('minutes') || 60;
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Member Not Found').setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    await member.timeout(minutes * 60000, reason);
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(config.colors.warning).setTitle('🔇 Member Muted')
        .addFields({ name: '👤 User', value: target.tag, inline: true }, { name: '⏳ Duration', value: `${minutes} minutes`, inline: true }, { name: '📝 Reason', value: reason })
        .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()],
    });
  },
};