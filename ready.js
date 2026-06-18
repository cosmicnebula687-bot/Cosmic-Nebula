const { ActivityType } = require('discord.js');

const activities = [
  { name: '🌌 the Galaxy Economy', type: ActivityType.Watching },
  { name: '☄️ Cosmic Credits', type: ActivityType.Watching },
  { name: '🚀 /help for commands', type: ActivityType.Playing },
  { name: '🪐 the Nebula', type: ActivityType.Watching },
  { name: '⭐ the stars align', type: ActivityType.Watching },
];

let activityIndex = 0;

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`\n✨ Nebula is online as ${client.user.tag}`);
    console.log(`🌌 Serving ${client.guilds.cache.size} galaxies (guilds)`);
    console.log(`👥 Watching over ${client.users.cache.size} space travelers\n`);

    client.user.setPresence({
      activities: [activities[0]],
      status: 'online',
    });

    setInterval(() => {
      activityIndex = (activityIndex + 1) % activities.length;
      client.user.setPresence({
        activities: [activities[activityIndex]],
        status: 'online',
      });
    }, 30000);
  },
};
