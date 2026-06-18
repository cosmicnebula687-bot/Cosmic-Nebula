const mongoose = require('mongoose');

const shopItemSchema = new mongoose.Schema({
  itemId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  sellPrice: { type: Number, default: 0 },
  rarity: {
    type: String,
    enum: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic'],
    default: 'Common',
  },
  category: {
    type: String,
    enum: ['Ships', 'Technology', 'Boosters', 'Cosmetics', 'Utilities', 'Crates', 'Premium'],
    required: true,
  },
  emoji: { type: String, default: '📦' },
  imageUrl: { type: String, default: null },
  buyable: { type: Boolean, default: true },
  sellable: { type: Boolean, default: true },
  usable: { type: Boolean, default: false },
  useEffect: { type: String, default: null },
  stock: { type: Number, default: -1 }, // -1 = unlimited
  enabled: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('ShopItem', shopItemSchema);
