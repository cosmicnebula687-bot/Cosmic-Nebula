const { SlashCommandBuilder } = require('discord.js');
const give = require('./give');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pay')
    .setDescription('💳 Pay another space traveler Cosmic Credits')
    .addUserOption(opt => opt.setName('user').setDescription('The user to pay').setRequired(true))
    .addIntegerOption(opt => opt.setName('amount').setDescription('Amount of credits to pay').setRequired(true).setMinValue(1)),
  cooldown: 5,
  execute: give.execute,
};
