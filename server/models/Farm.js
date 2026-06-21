const mongoose = require('mongoose');

const FarmSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmName: {
    type: String,
    required: [true, 'Please add a farm name'],
    trim: true
  },
  area: {
    type: Number,
    required: [true, 'Please add farm area (in acres)']
  },
  soilType: {
    type: String,
    required: [true, 'Please select a soil type'],
    enum: ['Alluvial', 'Black', 'Red', 'Laterite', 'Desert/Sandy', 'Clayey', 'Loamy', 'Silty']
  },
  location: {
    type: String,
    required: [true, 'Please add farm location details']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Farm', FarmSchema);
