const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Warning = require('./Warning');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('⚠️ Warn a member')
    .addUserOption(opt => opt.setName('user').setDescription('User to warn').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for warning').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  cooldown: 3,
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');

    const warning = await Warning.findOneAndUpdate(
      { userId: target.id, guildId: interaction.guild.id },
      { $push: { warnings: { reason, moderatorId: interaction.user.id, moderatorTag: interaction.user.tag } } },
      { upsert: true, new: true }
    );

    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(config.colors.warning).setTitle('⚠️ Warning Issued')
        .addFields(
          { name: '👤 User', value: target.tag, inline: true },
          { name: '🛡️ Moderator', value: interaction.user.tag, inline: true },
          { name: '📊 Total Warnings', value: `**${warning.warnings.length}**`, inline: true },
          { name: '📝 Reason', value: reason },
        )
        .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()],
    });

    // DM the user
    await target.send({
      embeds: [new EmbedBuilder().setColor(config.colors.warning).setTitle(`⚠️ You received a warning in ${interaction.guild.name}`)
        .addFields({ name: '📝 Reason', value: reason }, { name: '🛡️ Moderator', value: interaction.user.tag })
        .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()],
    }).catch(() => {});
  },
};