const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('./database');
const config = require('./config');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('🌌 View a space traveler\'s galactic profile')
    .addUserOption(opt => opt.setName('user').setDescription('User to view').setRequired(false)),
  cooldown: 5,
  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    const user = await getUser(target.id);
    const nextLevelXP = target.level * 100 + target.level * target.level * 50;
    const xpBar = Math.floor((user.xp / nextLevelXP) * 10);
    const progressBar = '█'.repeat(xpBar) + '░'.repeat(10 - xpBar);

    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle(`🌌 ${target.username}'s Galactic Profile`)
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '🏅 Title', value: user.title, inline: true },
        { name: '⭐ Level', value: `**${user.level}**`, inline: true },
        { name: '✨ Reputation', value: `**${user.reputation}**`, inline: true },
        { name: '☄️ Wallet', value: `**${user.wallet.toLocaleString()}** Credits`, inline: true },
        { name: '🏦 Bank', value: `**${user.bank.toLocaleString()}** Credits`, inline: true },
        { name: '🌌 Dark Matter', value: `**${user.darkMatter}**`, inline: true },
        { name: `📊 XP Progress [${progressBar}]`, value: `${user.xp.toLocaleString()} / ${nextLevelXP.toLocaleString()} XP`, inline: false },
        { name: '🎰 Gambling Stats', value: `Won: ☄️ ${user.gamblingStats.totalWon.toLocaleString()} | Lost: ☄️ ${user.gamblingStats.totalLost.toLocaleString()} | Games: ${user.gamblingStats.gamesPlayed}`, inline: false },
        { name: '🎒 Inventory Size', value: `**${user.inventory.length}** items`, inline: true },
        { name: '🏆 Achievements', value: `**${user.achievements.length}** unlocked`, inline: true },
      )
      .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};