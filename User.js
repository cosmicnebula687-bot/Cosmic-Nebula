const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  wallet: { type: Number, default: 500 },
  bank: { type: Number, default: 0 },
  darkMatter: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  reputation: { type: Number, default: 0 },
  inventory: [{
    itemId: String,
    name: String,
    emoji: String,
    quantity: { type: Number, default: 1 },
    rarity: String,
  }],
  achievements: [{ type: String }],
  dailyCooldown: { type: Number, default: 0 },
  weeklyCooldown: { type: Number, default: 0 },
  workCooldown: { type: Number, default: 0 },
  begCooldown: { type: Number, default: 0 },
  robCooldown: { type: Number, default: 0 },
  duelCooldown: { type: Number, default: 0 },
  gamblingStats: {
    totalWon: { type: Number, default: 0 },
    totalLost: { type: Number, default: 0 },
    gamesPlayed: { type: Number, default: 0 },
    biggestWin: { type: Number, default: 0 },
  },
  spaceStats: {
    asteroidsMinedTotal: { type: Number, default: 0 },
    planetsExplored: { type: Number, default: 0 },
    expeditionsCompleted: { type: Number, default: 0 },
    aliensEncountered: { type: Number, default: 0 },
  },
  badges: [{ type: String }],
  title: { type: String, default: 'Space Cadet' },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

userSchema.methods.addCredits = async function(amount) {
  this.wallet += amount;
  return this.save();
};

userSchema.methods.removeCredits = async function(amount) {
  this.wallet = Math.max(0, this.wallet - amount);
  return this.save();
};

userSchema.methods.addToBank = async function(amount) {
  this.bank += amount;
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
