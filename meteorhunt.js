const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('./database');
const { randomInt } = require('./embed');
const config = require('./config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('meteorhunt')
    .setDescription('🌠 Track and capture rare meteors for rewards'),
  cooldown: 2700,
  async execute(interaction) {
    const user = await getUser(interaction.user.id);
    const meteors = [
      { name: 'Iron Meteor', emoji: '🪨', value: randomInt(200, 600) },
      { name: 'Gold Meteor', emoji: '🟡', value: randomInt(600, 1800) },
      { name: 'Diamond Meteor', emoji: '💎', value: randomInt(1800, 5000) },
      { name: 'Antimatter Fragment', emoji: '🔮', value: randomInt(5000, 15000) },
    ];
    const weights = [50, 30, 15, 5];
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total, meteor = meteors[0];
    for (let i = 0; i < meteors.length; i++) { r -= weights[i]; if (r <= 0) { meteor = meteors[i]; break; } }

    const caught = Math.random() > 0.25;
    if (caught) { user.wallet += meteor.value; user.xp += randomInt(10, 40); }
    await user.save();

    const embed = new EmbedBuilder()
      .setColor(caught ? config.colors.success : config.colors.error)
      .setTitle(`🌠 Meteor Hunt — ${meteor.emoji} ${meteor.name}`)
      .setDescription(caught
        ? `Your tracking system locked onto the meteor and your retrieval drone captured it!`
        : `You tracked the meteor for hours but it escaped into deep space...`)
      .addFields(
        { name: '💰 Reward', value: caught ? `☄️ **${meteor.value.toLocaleString()}** Credits` : 'Nothing', inline: true },
        { name: '👛 Balance', value: `☄️ **${user.wallet.toLocaleString()}** Credits`, inline: true },
      )
      .setFooter({ text: '🌌 Nebula Bot • Hunt again in 45 minutes!' }).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};