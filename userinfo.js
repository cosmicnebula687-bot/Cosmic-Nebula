const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('👤 View detailed user information')
    .addUserOption(opt => opt.setName('user').setDescription('User to view').setRequired(false)),
  cooldown: 5,
  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    const roles = member?.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => `${r}`).join(', ') || 'None';

    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle(`👤 ${target.username}`)
      .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 256 }))
      .addFields(
        { name: '🆔 User ID', value: target.id, inline: true },
        { name: '🤖 Bot', value: target.bot ? 'Yes' : 'No', inline: true },
        { name: '📅 Account Created', value: `<t:${Math.floor(target.createdTimestamp/1000)}:D>`, inline: true },
        { name: '📥 Server Joined', value: member ? `<t:${Math.floor(member.joinedTimestamp/1000)}:D>` : 'N/A', inline: true },
        { name: '🎭 Display Name', value: member?.displayName || target.username, inline: true },
        { name: '⚡ Status', value: member?.presence?.status || 'Unknown', inline: true },
        { name: `🎭 Roles (${member?.roles.cache.size - 1 || 0})`, value: roles.length > 1024 ? roles.substring(0, 1020) + '...' : roles, inline: false },
      )
      .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};