const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('./database');
const { randomInt } = require('./embed');
const config = require('./config');

const RECIPES = [
  { name: 'Plasma Blade', emoji: '⚡', cost: 1000, successChance: 0.8, reward: { min: 2000, max: 4000 } },
  { name: 'Nebula Crystal', emoji: '🔮', cost: 2500, successChance: 0.7, reward: { min: 5000, max: 9000 } },
  { name: 'Void Engine', emoji: '🌑', cost: 5000, successChance: 0.55, reward: { min: 10000, max: 20000 } },
  { name: 'Dark Matter Core', emoji: '🌌', cost: 10000, successChance: 0.40, reward: { min: 25000, max: 50000 } },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('starforge')
    .setDescription('⚒️ Forge valuable items at the Star Forge')
    .addStringOption(opt => opt.setName('recipe').setDescription('What to forge').setRequired(true)
      .addChoices(...RECIPES.map(r => ({ name: `${r.emoji} ${r.name} (${r.cost.toLocaleString()} ☄️)`, value: r.name })))),
  cooldown: 10800,
  async execute(interaction) {
    const recipeName = interaction.options.getString('recipe');
    const recipe = RECIPES.find(r => r.name === recipeName);
    const user = await getUser(interaction.user.id);

    if (user.wallet < recipe.cost)
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('❌ Not Enough Credits').setDescription(`This recipe requires ☄️ **${recipe.cost.toLocaleString()}** Credits.`).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()], ephemeral: true });

    user.wallet -= recipe.cost;
    const success = Math.random() < recipe.successChance;
    if (success) {
      const reward = randomInt(recipe.reward.min, recipe.reward.max);
      user.wallet += reward;
      user.xp += randomInt(30, 100);
      await user.save();
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.gold).setTitle(`⚒️ Star Forge — ${recipe.emoji} ${recipe.name} Crafted!`).setDescription('The forge blazed with stellar energy and created a masterwork!').addFields({ name: '💰 Sold For', value: `☄️ **${reward.toLocaleString()}** Credits`, inline: true }, { name: '👛 Balance', value: `☄️ **${user.wallet.toLocaleString()}** Credits`, inline: true }).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()] });
    } else {
      await user.save();
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle(`⚒️ Star Forge — Crafting Failed!`).setDescription('The forge overloaded and consumed your materials!').addFields({ name: '💸 Lost', value: `☄️ **${recipe.cost.toLocaleString()}** Credits`, inline: true }, { name: '👛 Balance', value: `☄️ **${user.wallet.toLocaleString()}** Credits`, inline: true }).setFooter({ text: '🌌 Nebula Bot' }).setTimestamp()] });
    }
  },
};