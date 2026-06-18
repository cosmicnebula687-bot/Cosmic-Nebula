const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('🧹 Clear messages from a channel')
    .addIntegerOption(opt => opt.setName('amount').setDescription('Number of messages to delete (1-100)').setRequired(true).setMinValue(1).setMaxValue(100))
    .addUserOption(opt => opt.setName('user').setDescription('Clear messages from a specific user').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  cooldown: 5,
  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    const targetUser = interaction.options.getUser('user');

    await interaction.deferReply({ ephemeral: true });

    let messages = await interaction.channel.messages.fetch({ limit: 100 });
    if (targetUser) messages = messages.filter(m => m.author.id === targetUser.id);
    const toDelete = [...messages.values()].slice(0, amount).filter(m => Date.now() - m.createdTimestamp < 1209600000);

    const deleted = await interaction.channel.bulkDelete(toDelete, true).catch(() => null);
    const count = deleted ? deleted.size : 0;

    await interaction.editReply({
      embeds: [new EmbedBuilder().setColor(config.colors.success).setTitle('🧹 Messages Cleared')
        .addFields({ name: '🗑️ Deleted', value: `**${count}** messages`, inline: true }, { name: '📢 Channel', value: `${interaction.channel}`, inline: true })
        .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()],
    });
  },
};