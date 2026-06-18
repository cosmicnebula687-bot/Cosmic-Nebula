const mongoose = require('mongoose');
const User = require('./User');
const ShopItem = require('./ShopItem');

async function connectDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('🌌 Connected to MongoDB — Galaxy database online');
    await seedShopItems();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function getUser(userId) {
  let user = await User.findOne({ userId });
  if (!user) {
    user = await User.create({ userId });
  }
  return user;
}

async function seedShopItems() {
  const count = await ShopItem.countDocuments();
  if (count > 0) return;

  const items = [
    // Ships
    { itemId: 'scout_ship', name: 'Scout Ship', description: 'A nimble ship for fast reconnaissance missions.', price: 5000, sellPrice: 2500, rarity: 'Common', category: 'Ships', emoji: '🚀', sellable: true, usable: false },
    { itemId: 'cruiser', name: 'Galactic Cruiser', description: 'A mid-tier cruiser for exploring the outer rim.', price: 25000, sellPrice: 12000, rarity: 'Rare', category: 'Ships', emoji: '🛸', sellable: true, usable: false },
    { itemId: 'dreadnought', name: 'Nebula Dreadnought', description: 'The most feared warship in the galaxy.', price: 100000, sellPrice: 50000, rarity: 'Legendary', category: 'Ships', emoji: '⚔️', sellable: true, usable: false },
    // Technology
    { itemId: 'scanner', name: 'Quantum Scanner', description: 'Improves asteroid mining yield by 10%.', price: 2000, sellPrice: 800, rarity: 'Uncommon', category: 'Technology', emoji: '🔭', sellable: true, usable: true, useEffect: 'mining_boost' },
    { itemId: 'warp_core', name: 'Warp Core', description: 'Reduces travel cooldowns by 20%.', price: 8000, sellPrice: 3500, rarity: 'Rare', category: 'Technology', emoji: '⚡', sellable: true, usable: true, useEffect: 'cooldown_reduce' },
    { itemId: 'ai_pilot', name: 'AI Co-Pilot', description: 'Doubles work earnings for 24 hours.', price: 15000, sellPrice: 7000, rarity: 'Epic', category: 'Technology', emoji: '🤖', sellable: true, usable: true, useEffect: 'work_boost' },
    // Boosters
    { itemId: 'credit_booster', name: 'Credit Booster', description: 'Doubles all credit earnings for 1 hour.', price: 3000, sellPrice: 1200, rarity: 'Uncommon', category: 'Boosters', emoji: '☄️', sellable: false, usable: true, useEffect: 'credit_boost' },
    { itemId: 'xp_booster', name: 'XP Booster', description: 'Doubles XP gain for 1 hour.', price: 3500, sellPrice: 1500, rarity: 'Uncommon', category: 'Boosters', emoji: '✨', sellable: false, usable: true, useEffect: 'xp_boost' },
    { itemId: 'luck_charm', name: 'Luck Charm', description: 'Increases gambling luck for 30 minutes.', price: 5000, sellPrice: 0, rarity: 'Rare', category: 'Boosters', emoji: '🍀', sellable: false, usable: true, useEffect: 'luck_boost' },
    // Cosmetics
    { itemId: 'nebula_title', name: 'Nebula Title', description: 'Equip the prestigious "Nebula Walker" title.', price: 10000, sellPrice: 0, rarity: 'Epic', category: 'Cosmetics', emoji: '🎨', sellable: false, usable: true, useEffect: 'title_nebula' },
    { itemId: 'galaxy_banner', name: 'Galaxy Banner', description: 'A stunning galaxy-themed profile banner.', price: 7500, sellPrice: 0, rarity: 'Rare', category: 'Cosmetics', emoji: '🖼️', sellable: false, usable: false },
    // Utilities
    { itemId: 'vault_key', name: 'Vault Key', description: 'Unlocks a special bank vault for bonus storage.', price: 12000, sellPrice: 5000, rarity: 'Rare', category: 'Utilities', emoji: '🔑', sellable: true, usable: true, useEffect: 'vault_open' },
    { itemId: 'shield_gen', name: 'Shield Generator', description: 'Protects against robbery for 2 hours.', price: 4000, sellPrice: 1600, rarity: 'Uncommon', category: 'Utilities', emoji: '🛡️', sellable: true, usable: true, useEffect: 'rob_shield' },
    // Crates
    { itemId: 'common_crate', name: 'Common Crate', description: 'Contains random common items.', price: 500, sellPrice: 100, rarity: 'Common', category: 'Crates', emoji: '📦', sellable: true, usable: true, useEffect: 'open_crate_common' },
    { itemId: 'nebula_crate', name: 'Nebula Crate', description: 'Contains rare or better items.', price: 5000, sellPrice: 2000, rarity: 'Rare', category: 'Crates', emoji: '🎁', sellable: true, usable: true, useEffect: 'open_crate_nebula' },
    // Premium
    { itemId: 'dark_matter_pack', name: 'Dark Matter Pack (100)', description: 'Receive 100 Dark Matter premium currency.', price: 50000, sellPrice: 0, rarity: 'Mythic', category: 'Premium', emoji: '🌌', buyable: true, sellable: false, usable: true, useEffect: 'grant_dark_matter_100' },
    { itemId: 'vip_pass', name: 'VIP Galactic Pass', description: 'Unlock VIP perks across the galaxy for 30 days.', price: 100000, sellPrice: 0, rarity: 'Mythic', category: 'Premium', emoji: '👑', buyable: true, sellable: false, usable: true, useEffect: 'grant_vip' },
  ];

  await ShopItem.insertMany(items);
  console.log('🛒 Shop items seeded successfully');
}

module.exports = { connectDatabase, getUser };