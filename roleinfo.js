const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('./config');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('roleinfo')
    .setDescription('🎭 View information about a role')
    .addRoleOption(opt => opt.setName('role').setDescription('Role to view').setRequired(true)),
  cooldown: 5,
  async execute(interaction) {
    const role = interaction.options.getRole('role');
    const members = interaction.guild.members.cache.filter(m => m.roles.cache.has(role.id));

    const embed = new EmbedBuilder()
      .setColor(role.color || config.colors.primary)
      .setTitle(`🎭 Role: ${role.name}`)
      .addFields(
        { name: '🆔 Role ID', value: role.id, inline: true },
        { name: '🎨 Color', value: role.hexColor, inline: true },
        { name: '📅 Created', value: `<t:${Math.floor(role.createdTimestamp/1000)}:D>`, inline: true },
        { name: '👥 Members', value: `**${members.size}**`, inline: true },
        { name: '📌 Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true },
        { name: '📌 Hoisted', value: role.hoist ? 'Yes' : 'No', inline: true },
        { name: '🤖 Managed', value: role.managed ? 'Yes' : 'No', inline: true },
        { name: '📊 Position', value: `#${role.position}`, inline: true },
      )
      .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};