const { PermissionFlagsBits } = require('discord.js');
const { errorEmbed } = require('./embed');

function requirePermission(...permissions) {
  return (interaction) => {
    for (const perm of permissions) {
      if (!interaction.member.permissions.has(perm)) {
        interaction.reply({ embeds: [errorEmbed('You lack the required permissions to use this command.')], ephemeral: true });
        return false;
      }
    }
    return true;
  };
}

function isMod(interaction) {
  return interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers) ||
         interaction.member.permissions.has(PermissionFlagsBits.ManageMessages);
}

function isAdmin(interaction) {
  return interaction.member.permissions.has(PermissionFlagsBits.Administrator) ||
         interaction.member.permissions.has(PermissionFlagsBits.ManageGuild);
}

module.exports = { requirePermission, isMod, isAdmin };
