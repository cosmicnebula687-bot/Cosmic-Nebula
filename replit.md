# Nebula — Galaxy Economy & Moderation Discord Bot

A full-featured Discord bot with 71 slash commands covering a space/galaxy economy, gambling, PvP, a Galactic Shop, 12 space mini-games, and complete server moderation. Built with Discord.js v14 and MongoDB.

## Run & Operate

```bash
# 1. Deploy slash commands to Discord (run once per server)
node deploy-commands.js

# 2. Start the bot
node index.js
```

## Required Environment Variables

| Variable | Description |
|---|---|
| `DISCORD_TOKEN` | Bot token from Discord Developer Portal |
| `MONGODB_URI` | MongoDB connection string (Atlas or self-hosted) |
| `CLIENT_ID` | Bot's Application/Client ID |

## Stack

- **Runtime:** Node.js ≥22
- **Discord:** discord.js v14
- **Database:** MongoDB + Mongoose v8
- **Deploy:** Railway (config/railway.toml included)

## Directory Structure

```
/
├── commands/
│   ├── economy/      (9 commands)
│   ├── gambling/     (10 commands)
│   ├── pvp/          (4 commands)
│   ├── leaderboard/  (3 commands)
│   ├── shop/         (7 commands)
│   ├── space/        (12 commands)
│   ├── moderation/   (18 commands)
│   └── admin/        (8 commands)
├── events/           (ready, interactionCreate, guildCreate)
├── models/           (User, ShopItem, GuildSettings, Warning)
├── utils/            (database, embed, permissions)
├── config/           (config.js, railway.toml)
├── index.js          (entry point)
└── deploy-commands.js
```

## Commands (71 total)

**Economy:** balance, daily, weekly, work, beg, deposit, withdraw, give, pay

**Gambling:** coinflip, dice, slots, blackjack, roulette, higherlower, crash, mines, rps, wheel

**PvP:** duel, rob, heist, fight

**Leaderboard:** leaderboard, profile, inventory

**Shop:** shop, buy, sell, use, gift, quest, luck

**Space Games:** asteroidmine, spacescan, planetexplore, salvage, spacefishing, wormhole, meteorhunt, starforge, galaxyraid, alienencounter, spaceexpedition, terraform

**Moderation:** ban, unban, kick, mute, unmute, timeout, untimeout, warn, warnings, clear, slowmode, lock, unlock, nickname, purge, serverinfo, userinfo, roleinfo

**Admin:** economy-reset, add-money, remove-money, set-money, add-item, remove-item, create-shop-item, delete-shop-item

## Deploy to Railway

1. Push this repo to GitHub
2. Create a new Railway project → Deploy from GitHub repo
3. Add environment variables: `DISCORD_TOKEN`, `MONGODB_URI`, `CLIENT_ID`
4. Railway auto-detects `config/railway.toml` and runs `node index.js`

## Theme

- **Name:** Nebula 🌌
- **Currency:** Cosmic Credits ☄️ | Dark Matter 🌌 (premium)
- **Palette:** Purple / Blue / Black
