const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('🌌 View detailed server information'),
  cooldown: 5,
  async execute(interaction) {
    const guild = interaction.guild;
    await guild.members.fetch();

    const bots = guild.members.cache.filter(m => m.user.bot).size;
    const humans = guild.memberCount - bots;
    const online = guild.members.cache.filter(m => m.presence?.status !== 'offline').size;

    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle(`🌌 ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: '🆔 Server ID', value: guild.id, inline: true },
        { name: '👑 Owner', value: `<@${guild.ownerId}>`, inline: true },
        { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp/1000)}:D>`, inline: true },
        { name: '👥 Members', value: `${guild.memberCount} total\n${humans} humans • ${bots} bots`, inline: true },
        { name: '💬 Channels', value: `${guild.channels.cache.size} total`, inline: true },
        { name: '🎭 Roles', value: `${guild.roles.cache.size}`, inline: true },
        { name: '😀 Emojis', value: `${guild.emojis.cache.size}`, inline: true },
        { name: '🔒 Verification', value: guild.verificationLevel.toString(), inline: true },
        { name: '🚀 Boosts', value: `${guild.premiumSubscriptionCount || 0} (Tier ${guild.premiumTier})`, inline: true },
      )
      .setImage(guild.bannerURL({ size: 1024 }))
      .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};