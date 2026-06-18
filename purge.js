const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('🗑️ Purge messages matching criteria')
    .addIntegerOption(opt => opt.setName('amount').setDescription('Number of messages to scan (1-100)').setRequired(true).setMinValue(1).setMaxValue(100))
    .addStringOption(opt => opt.setName('filter').setDescription('Filter type').addChoices(
      { name: '🤖 Bots only', value: 'bots' },
      { name: '👤 Humans only', value: 'humans' },
      { name: '🔗 Links only', value: 'links' },
      { name: '📎 Attachments only', value: 'attachments' },
      { name: 'All messages', value: 'all' },
    ).setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  cooldown: 5,
  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    const filter = interaction.options.getString('filter') || 'all';
    await interaction.deferReply({ ephemeral: true });

    let messages = await interaction.channel.messages.fetch({ limit: 100 });
    const now = Date.now();
    messages = messages.filter(m => now - m.createdTimestamp < 1209600000);

    if (filter === 'bots') messages = messages.filter(m => m.author.bot);
    else if (filter === 'humans') messages = messages.filter(m => !m.author.bot);
    else if (filter === 'links') messages = messages.filter(m => m.content.includes('http'));
    else if (filter === 'attachments') messages = messages.filter(m => m.attachments.size > 0);

    const toDelete = [...messages.values()].slice(0, amount);
    const deleted = await interaction.channel.bulkDelete(toDelete, true).catch(() => null);

    await interaction.editReply({
      embeds: [new EmbedBuilder().setColor(config.colors.success).setTitle('🗑️ Purge Complete')
        .addFields({ name: '🗑️ Deleted', value: `**${deleted?.size || 0}** messages`, inline: true }, { name: '🔍 Filter', value: filter, inline: true })
        .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()],
    });
  },
};