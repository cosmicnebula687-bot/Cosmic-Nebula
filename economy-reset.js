const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const User = require('./User');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('economy-reset')
    .setDescription('♻️ Reset a user\'s economy data')
    .addUserOption(opt => opt.setName('user').setDescription('User to reset').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  cooldown: 5,
  async execute(interaction) {
    const target = interaction.options.getUser('user');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('reset_confirm').setLabel('✅ Confirm Reset').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('reset_cancel').setLabel('❌ Cancel').setStyle(ButtonStyle.Secondary),
    );

    const msg = await interaction.reply({
      embeds: [new EmbedBuilder().setColor(config.colors.warning).setTitle('⚠️ Confirm Economy Reset')
        .setDescription(`Are you sure you want to reset **${target.username}**'s economy data?\nThis will wipe their wallet, bank, inventory, and stats.`)
        .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()],
      components: [row], fetchReply: true,
    });

    const collector = msg.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: 30000 });
    collector.on('collect', async i => {
      collector.stop();
      if (i.customId === 'reset_confirm') {
        await User.findOneAndUpdate({ userId: target.id }, {
          wallet: 500, bank: 0, darkMatter: 0, xp: 0, level: 1, inventory: [], gamblingStats: { totalWon: 0, totalLost: 0, gamesPlayed: 0, biggestWin: 0 },
        });
        await i.update({ embeds: [new EmbedBuilder().setColor(config.colors.success).setTitle('♻️ Economy Reset').setDescription(`**${target.username}**'s economy has been reset.`).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], components: [] });
      } else {
        await i.update({ embeds: [new EmbedBuilder().setColor(config.colors.secondary).setTitle('❌ Reset Cancelled').setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], components: [] });
      }
    });
    collector.on('end', async (_, reason) => { if (reason === 'time') await msg.edit({ components: [] }).catch(() => {}); });
  },
};