module.exports = {
  // Color palette
  colors: {
    primary: 0x7B2FBE,
    secondary: 0x4A90D9,
    success: 0x2ECC71,
    error: 0xE74C3C,
    warning: 0xF39C12,
    gold: 0xF1C40F,
    dark: 0x1A1A2E,
    nebula: 0x9B59B6,
  },

  // Economy settings
  economy: {
    currency: 'Cosmic Credits',
    currencyEmoji: '☄️',
    premiumCurrency: 'Dark Matter',
    premiumEmoji: '🌌',
    startingBalance: 500,
    dailyMin: 200,
    dailyMax: 500,
    weeklyMin: 1500,
    weeklyMax: 3500,
    workMin: 50,
    workMax: 300,
    begMin: 10,
    begMax: 100,
    bankLimit: 1000000,
    dailyCooldown: 86400000,    // 24h
    weeklyCooldown: 604800000,  // 7d
    workCooldown: 3600000,      // 1h
    begCooldown: 300000,        // 5m
    robCooldown: 3600000,       // 1h
  },

  // Gambling settings
  gambling: {
    minBet: 10,
    maxBet: 100000,
    crashMultiplierMax: 10,
    minesGridSize: 25,
    wheelSegments: [
      { label: '💥 Bust', multiplier: 0, color: 0xE74C3C, weight: 30 },
      { label: '0.5x', multiplier: 0.5, color: 0xF39C12, weight: 25 },
      { label: '1.5x', multiplier: 1.5, color: 0x3498DB, weight: 20 },
      { label: '2x', multiplier: 2, color: 0x9B59B6, weight: 13 },
      { label: '3x', multiplier: 3, color: 0x2ECC71, weight: 8 },
      { label: '5x', multiplier: 5, color: 0xF1C40F, weight: 3 },
      { label: '10x', multiplier: 10, color: 0xFF00FF, weight: 1 },
    ],
  },

  // XP settings
  xp: {
    perMessage: { min: 5, max: 15 },
    levelFormula: (lvl) => lvl * 100 + lvl * lvl * 50,
  },

  // Space-themed job list
  jobs: [
    { name: 'Repair a Satellite', emoji: '🛰️', min: 80, max: 250 },
    { name: 'Mine an Asteroid', emoji: '☄️', min: 100, max: 300 },
    { name: 'Deliver Cargo to Mars', emoji: '🚀', min: 90, max: 220 },
    { name: 'Research a Black Hole', emoji: '🌑', min: 120, max: 280 },
    { name: 'Calibrate a Warp Drive', emoji: '⚡', min: 150, max: 350 },
    { name: 'Navigate a Nebula', emoji: '🌌', min: 70, max: 200 },
    { name: 'Patrol the Outer Rim', emoji: '🛸', min: 80, max: 180 },
    { name: 'Terraform a Moon', emoji: '🌙', min: 100, max: 260 },
    { name: 'Scan for Dark Matter', emoji: '🔭', min: 130, max: 300 },
    { name: 'Trade at a Space Station', emoji: '🪐', min: 60, max: 190 },
    { name: 'Repair a Cosmic Array', emoji: '📡', min: 90, max: 230 },
    { name: 'Escort a Galactic Convoy', emoji: '🌠', min: 110, max: 270 },
  ],

  // Beg responses
  begResponses: [
    { text: 'A passing comet dropped some credits!', success: true },
    { text: 'A kind space traveler tossed you some credits.', success: true },
    { text: 'An alien merchant took pity on you.', success: true },
    { text: 'You found some credits floating in the void!', success: true },
    { text: 'A space pirate flipped you some change.', success: true },
    { text: 'The galaxy ignored your pleas...', success: false },
    { text: 'Even the black holes laughed at you.', success: false },
    { text: 'A robot stole your last credit instead.', success: false },
  ],

  // Emojis
  emojis: {
    loading: '⏳',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    credits: '☄️',
    darkMatter: '🌌',
    wallet: '👛',
    bank: '🏦',
    space: '🚀',
    star: '⭐',
    planet: '🪐',
    nebula: '🌌',
    shield: '🛡️',
    sword: '⚔️',
    coin: '🪙',
    gem: '💎',
    chest: '📦',
    crown: '👑',
  },
};
