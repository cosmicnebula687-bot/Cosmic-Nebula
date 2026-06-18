const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { getUser } = require('./database');
const { randomInt } = require('./embed');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('heist')
    .setDescription('🏦 Organize a galactic bank heist with your crew')
    .addIntegerOption(opt => opt.setName('target').setDescription('Credits to target').setRequired(true).setMinValue(500)),
  cooldown: 30,
  async execute(interaction) {
    const target = interaction.options.getInteger('target');
    const crew = new Map();
    crew.set(interaction.user.id, interaction.user);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('heist_join').setLabel('🚀 Join Heist').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('heist_start').setLabel('⚡ Launch Heist').setStyle(ButtonStyle.Primary),
    );

    const embed = new EmbedBuilder()
      .setColor(0x7B2FBE)
      .setTitle('🏦 Galactic Heist Planning')
      .setDescription(`**${interaction.user.username}** is organizing a heist on a galactic bank!\nTarget: ☄️ **${target.toLocaleString()}** Credits\n\nJoin the crew before the heist launches!`)
      .addFields({ name: '👥 Crew', value: `• ${interaction.user.username}`, inline: false })
      .setFooter({ text: '🌌 Nebula Bot • 60s to gather crew' }).setTimestamp();

    const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });
    const collector = msg.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async i => {
      if (i.customId === 'heist_join') {
        if (crew.has(i.user.id)) return i.reply({ content: 'You\'re already in the crew!', ephemeral: true });
        if (crew.size >= 5) return i.reply({ content: 'The crew is full!', ephemeral: true });
        const u = await getUser(i.user.id);
        if (u.wallet < 200) return i.reply({ content: 'You need at least ☄️ 200 Credits to join a heist!', ephemeral: true });
        crew.set(i.user.id, i.user);
        const crewList = Array.from(crew.values()).map(u => `• ${u.username}`).join('\n');
        const updated = EmbedBuilder.from(embed).setFields({ name: '👥 Crew', value: crewList });
        await i.update({ embeds: [updated] });
      } else if (i.customId === 'heist_start' && i.user.id === interaction.user.id) {
        collector.stop('launch');
        const successChance = Math.min(0.3 + crew.size * 0.15, 0.85);
        const won = Math.random() < successChance;
        const results = [];

        for (const [uid, usr] of crew) {
          const u = await getUser(uid);
          if (won) {
            const share = Math.floor(target / crew.size);
            u.wallet += share;
            results.push(`✅ ${usr.username}: +☄️ ${share.toLocaleString()}`);
          } else {
            const fine = randomInt(100, 300);
            u.wallet = Math.max(0, u.wallet - fine);
            results.push(`❌ ${usr.username}: -☄️ ${fine.toLocaleString()}`);
          }
          await u.save();
        }

        const resultEmbed = new EmbedBuilder()
          .setColor(won ? config.colors.success : config.colors.error)
          .setTitle(won ? '🎉 Heist Successful!' : '🚨 Heist Failed!')
          .setDescription(won ? 'The crew cracked the vault and escaped!' : 'Galaxy security foiled the heist!')
          .addFields({ name: '📊 Results', value: results.join('\n') })
          .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp();
        await i.update({ embeds: [resultEmbed], components: [] });
      }
    });

    collector.on('end', async (_, reason) => {
      if (reason === 'time') await msg.edit({ components: [] }).catch(() => {});
    });
  },
};