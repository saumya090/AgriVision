const mongoose = require('mongoose');

const HarvestSchema = new mongoose.Schema({
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true
  },
  cropName: {
    type: String,
    required: [true, 'Please add the crop name']
  },
  quantity: {
    type: Number, // In kg
    required: [true, 'Please add harvest quantity']
  },
  sellingPrice: {
    type: Number, // Per kg
    required: [true, 'Please add selling price per unit']
  },
  totalRevenue: {
    type: Number // Automatically calculated: quantity * sellingPrice
  },
  date: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to calculate totalRevenue
HarvestSchema.pre('save', function (next) {
  this.totalRevenue = this.quantity * this.sellingPrice;
  next();
});

module.exports = mongoose.model('Harvest', HarvestSchema);
