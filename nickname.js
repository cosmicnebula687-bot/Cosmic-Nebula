const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nickname')
    .setDescription('✏️ Change or reset a member\'s nickname')
    .addUserOption(opt => opt.setName('user').setDescription('User to change nickname').setRequired(true))
    .addStringOption(opt => opt.setName('nickname').setDescription('New nickname (leave empty to reset)').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),
  cooldown: 3,
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const nickname = interaction.options.getString('nickname') || null;
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Member Not Found').setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    await member.setNickname(nickname);
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(config.colors.success).setTitle('✏️ Nickname Updated')
        .addFields({ name: '👤 User', value: target.tag, inline: true }, { name: '📛 New Nickname', value: nickname || '*(Reset)*', inline: true })
        .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()],
    });
  },
};