const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('./database');
const { formatTime, randomInt } = require('./embed');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rob')
    .setDescription('🦹 Attempt to rob another space traveler\'s wallet')
    .addUserOption(opt => opt.setName('user').setDescription('The user to rob').setRequired(true)),
  cooldown: 5,
  async execute(interaction) {
    const target = interaction.options.getUser('user');

    if (target.id === interaction.user.id)
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Invalid Target').setDescription("You can't rob yourself!").setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });
    if (target.bot)
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Invalid Target').setDescription("You can't rob a bot!").setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    const robber = await getUser(interaction.user.id);
    const victim = await getUser(target.id);
    const now = Date.now();

    if (robber.robCooldown && now - robber.robCooldown < config.economy.robCooldown) {
      const remaining = config.economy.robCooldown - (now - robber.robCooldown);
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.warning).setTitle('⏳ Rob Cooldown').setDescription(`You must lay low for **${formatTime(remaining)}** before robbing again.`).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });
    }

    if (victim.wallet < 100)
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.warning).setTitle('💸 Not Worth It').setDescription(`${target.username} has too few credits to rob!`).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    robber.robCooldown = now;
    const successChance = 0.55;

    if (Math.random() < successChance) {
      const stolen = randomInt(Math.floor(victim.wallet * 0.1), Math.floor(victim.wallet * 0.35));
      robber.wallet += stolen;
      victim.wallet -= stolen;
      await robber.save(); await victim.save();

      await interaction.reply({
        embeds: [new EmbedBuilder().setColor(config.colors.success).setTitle('🦹 Heist Successful!')
          .setDescription(`You snuck through the nebula and pickpocketed **${target.username}**!`)
          .addFields({ name: '💸 Stolen', value: `☄️ **${stolen.toLocaleString()}** Credits`, inline: true }, { name: '👛 Your Balance', value: `☄️ **${robber.wallet.toLocaleString()}** Credits`, inline: true })
          .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()],
      });
    } else {
      const fine = randomInt(50, 200);
      robber.wallet = Math.max(0, robber.wallet - fine);
      await robber.save();

      await interaction.reply({
        embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('🚨 Caught Red-Handed!')
          .setDescription(`The galaxy police caught you trying to rob **${target.username}**!`)
          .addFields({ name: '💸 Fine', value: `☄️ **${fine.toLocaleString()}** Credits`, inline: true }, { name: '👛 Your Balance', value: `☄️ **${robber.wallet.toLocaleString()}** Credits`, inline: true })
          .setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()],
      });
    }
  },
};