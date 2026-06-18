const mongoose = require('mongoose');

const warningSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  warnings: [{
    reason: String,
    moderatorId: String,
    moderatorTag: String,
    timestamp: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

warningSchema.index({ userId: 1, guildId: 1 }, { unique: true });

module.exports = mongoose.model('Warning', warningSchema);
