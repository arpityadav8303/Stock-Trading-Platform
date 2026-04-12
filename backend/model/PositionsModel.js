const mongoose = require('mongoose');
const { PositionsSchema } = require('../schemas/PositionsSchema');

// ✅ Correct model name and export
const Positions = mongoose.models.Positions || mongoose.model('Positions', PositionsSchema);

module.exports = { PositionsModel: Positions };