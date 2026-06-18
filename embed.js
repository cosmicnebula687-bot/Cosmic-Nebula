const { EmbedBuilder } = require('discord.js');
const config = require('./config');

function nebulaEmbed(title, description, color = config.colors.primary) {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: '🌌 Nebula Bot • Galaxy Economy' })
    .setTimestamp();
}

function errorEmbed(message) {
  return new EmbedBuilder()
    .setColor(config.colors.error)
    .setTitle('❌ Error')
    .setDescription(message)
    .setFooter({ text: '🌌 Nebula Bot' })
    .setTimestamp();
}

function successEmbed(title, message) {
  return new EmbedBuilder()
    .setColor(config.colors.success)
    .setTitle(`✅ ${title}`)
    .setDescription(message)
    .setFooter({ text: '🌌 Nebula Bot' })
    .setTimestamp();
}

function cooldownEmbed(timeLeft) {
  return new EmbedBuilder()
    .setColor(config.colors.warning)
    .setTitle('⏳ On Cooldown')
    .setDescription(`You must wait **${timeLeft}** before using this command again.`)
    .setFooter({ text: '🌌 Nebula Bot' })
    .setTimestamp();
}

function formatCredits(amount) {
  return `${config.emojis.credits} **${amount.toLocaleString()}** Cosmic Credits`;
}

function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

function rarityColor(rarity) {
  const map = {
    Common: 0xAAAAAA,
    Uncommon: 0x2ECC71,
    Rare: 0x3498DB,
    Epic: 0x9B59B6,
    Legendary: 0xF1C40F,
    Mythic: 0xFF00FF,
  };
  return map[rarity] || 0xAAAAAA;
}

function rarityEmoji(rarity) {
  const map = {
    Common: '⚪',
    Uncommon: '🟢',
    Rare: '🔵',
    Epic: '🟣',
    Legendary: '🟡',
    Mythic: '🌸',
  };
  return map[rarity] || '⚪';
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = { nebulaEmbed, errorEmbed, successEmbed, cooldownEmbed, formatCredits, formatTime, rarityColor, rarityEmoji, randomInt };