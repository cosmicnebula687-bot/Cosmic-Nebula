const GuildSettings = require('./GuildSettings');

module.exports = {
  name: 'guildCreate',
  async execute(guild) {
    await GuildSettings.findOneAndUpdate(
      { guildId: guild.id },
      { guildId: guild.id },
      { upsert: true, new: true }
    );
    console.log(`🚀 Joined new galaxy: ${guild.name} (${guild.id})`);
  },
};