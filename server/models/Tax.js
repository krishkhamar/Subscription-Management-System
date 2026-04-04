const mongoose = require('mongoose');

const taxSchema = new mongoose.Schema({
  taxName: {
    type: String,
    required: [true, 'Tax name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  rate: {
    type: Number,
    required: [true, 'Tax rate is required'],
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Tax', taxSchema);
