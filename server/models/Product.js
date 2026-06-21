const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cropName: {
    type: String,
    required: [true, 'Please add a crop name for product'],
    trim: true
  },
  quantity: {
    type: String, // e.g. "500 kg", "20 quintals"
    required: [true, 'Please add quantity details']
  },
  price: {
    type: Number, // price in rupees
    required: [true, 'Please add price details']
  },
  location: {
    type: String,
    required: [true, 'Please add location details']
  },
  description: {
    type: String,
    trim: true
  },
  contactPhone: {
    type: String,
    required: [true, 'Please add seller contact details']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', ProductSchema);
