const mongoose = require('mongoose');

const IrrigationSchema = new mongoose.Schema({
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Please add irrigation date']
  },
  duration: {
    type: Number, // In minutes
    required: [true, 'Please add duration in minutes']
  },
  waterUsed: {
    type: Number, // In litres
    required: [true, 'Please add water used in litres']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Irrigation', IrrigationSchema);
