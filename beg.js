const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('./database');
const { formatTime, randomInt } = require('./embed');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('beg')
    .setDescription('🙏 Beg galactic travelers for Cosmic Credits'),
  cooldown: 3,
  async execute(interaction) {
    const user = await getUser(interaction.user.id);
    const now = Date.now();
    const cooldown = config.economy.begCooldown;

    if (user.begCooldown && now - user.begCooldown < cooldown) {
      const remaining = cooldown - (now - user.begCooldown);
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(config.colors.warning).setTitle('⏳ Not So Fast!').setDescription(`You can beg again in **${formatTime(remaining)}**.`).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()],
        ephemeral: true,
      });
    }

    const response = config.begResponses[Math.floor(Math.random() * config.begResponses.length)];
    user.begCooldown = now;

    if (response.success) {
      const amount = randomInt(config.economy.begMin, config.economy.begMax);
      user.wallet += amount;
      await user.save();

      const embed = new EmbedBuilder()
        .setColor(config.colors.success)
        .setTitle('🌠 Someone Took Pity on You!')
        .setDescription(response.text)
        .addFields(
          { name: '💸 Received', value: `☄️ **${amount.toLocaleString()}** Credits`, inline: true },
          { name: '👛 New Balance', value: `☄️ **${user.wallet.toLocaleString()}** Credits`, inline: true },
        )
        .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp();
      await interaction.reply({ embeds: [embed] });
    } else {
      await user.save();
      const embed = new EmbedBuilder()
        .setColor(config.colors.error)
        .setTitle('😔 No Luck This Time')
        .setDescription(response.text)
        .setFooter({ text: '🌌 Nebula Bot • Try again in 5 minutes' }).setTimestamp();
      await interaction.reply({ embeds: [embed] });
    }
  },
};