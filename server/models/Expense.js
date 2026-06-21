const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true
  },
  category: {
    type: String,
    enum: ['Seeds', 'Fertilizer', 'Labor', 'Equipment', 'Miscellaneous'],
    required: [true, 'Please select a category']
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount']
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Please select a date'],
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Expense', ExpenseSchema);
