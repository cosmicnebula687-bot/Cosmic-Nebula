const mongoose = require('mongoose');

const guildSettingsSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  prefix: { type: String, default: '!' },
  economyEnabled: { type: Boolean, default: true },
  gamblingEnabled: { type: Boolean, default: true },
  logsChannel: { type: String, default: null },
  modLogsChannel: { type: String, default: null },
  welcomeChannel: { type: String, default: null },
  welcomeMessage: { type: String, default: 'Welcome to the galaxy, {user}!' },
  mutedRole: { type: String, default: null },
  autoRoles: [{ type: String }],
  disabledCommands: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('GuildSettings', guildSettingsSchema);
