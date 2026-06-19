const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { formatTime } = require('./embed');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('⏱️ Timeout a member (mute with Discord native timeout)')
    .addUserOption(opt => opt.setName('user').setDescription('User to timeout').setRequired(true))
    .addIntegerOption(opt => opt.setName('minutes').setDescription('Duration in minutes (1-40320)').setRequired(true).setMinValue(1).setMaxValue(40320))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  cooldown: 3,
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const minutes = interaction.options.getInteger('minutes');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    if (!member) return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Member Not Found').setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    await member.timeout(minutes * 60000, reason);
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(config.colors.warning).setTitle('⏱️ Member Timed Out')
        .addFields({ name: '👤 User', value: target.tag, inline: true }, { name: '⏳ Duration', value: formatTime(minutes * 60000), inline: true }, { name: '🛡️ Moderator', value: interaction.user.tag, inline: true }, { name: '📝 Reason', value: reason })
        .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()],
    });
  },
};
