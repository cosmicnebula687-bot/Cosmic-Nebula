const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Warning = require('./Warning');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('📋 View warnings for a member')
    .addUserOption(opt => opt.setName('user').setDescription('User to check').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  cooldown: 3,
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const record = await Warning.findOne({ userId: target.id, guildId: interaction.guild.id });

    if (!record || record.warnings.length === 0)
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.success).setTitle('✅ No Warnings').setDescription(`${target.username} has no warnings.`).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()] });

    const warnList = record.warnings.map((w, i) =>
      `**${i+1}.** ${w.reason} — by ${w.moderatorTag} <t:${Math.floor(new Date(w.timestamp).getTime()/1000)}:R>`
    ).join('\n');

    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(config.colors.warning).setTitle(`⚠️ Warnings for ${target.username}`)
        .setDescription(warnList)
        .addFields({ name: '📊 Total', value: `**${record.warnings.length}** warning(s)`, inline: true })
        .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()],
    });
  },
};