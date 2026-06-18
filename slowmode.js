const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('🐌 Set channel slowmode')
    .addIntegerOption(opt => opt.setName('seconds').setDescription('Slowmode in seconds (0 to disable)').setRequired(true).setMinValue(0).setMaxValue(21600))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  cooldown: 3,
  async execute(interaction) {
    const seconds = interaction.options.getInteger('seconds');
    await interaction.channel.setRateLimitPerUser(seconds);
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(config.colors.secondary).setTitle('🐌 Slowmode Updated')
        .setDescription(seconds === 0 ? '✅ Slowmode disabled.' : `Slowmode set to **${seconds}** seconds.`)
        .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()],
    });
  },
};