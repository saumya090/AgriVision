const mongoose = require('mongoose');

const SchemeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add scheme title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add scheme description']
  },
  eligibility: {
    type: String,
    required: [true, 'Please add eligibility criteria']
  },
  state: {
    type: String,
    required: [true, 'Please add state (use "All" for national schemes)'],
    default: 'All'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Scheme', SchemeSchema);
