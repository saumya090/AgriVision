const mongoose = require('mongoose');

const CropSchema = new mongoose.Schema({
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true
  },
  cropName: {
    type: String,
    required: [true, 'Please add a crop name'],
    trim: true
  },
  sowingDate: {
    type: Date,
    required: [true, 'Please add a sowing date']
  },
  harvestDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Planned', 'Active', 'Harvested'],
    default: 'Active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Crop', CropSchema);
