const mongoose = require('mongoose');

const recurringPlanSchema = new mongoose.Schema({
  planName: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  billingPeriod: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: [true, 'Billing period is required']
  },
  minimumQuantity: {
    type: Number,
    default: 1,
    min: 1
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  autoClose: {
    type: Boolean,
    default: false
  },
  closable: {
    type: Boolean,
    default: true
  },
  pausable: {
    type: Boolean,
    default: false
  },
  renewable: {
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

module.exports = mongoose.model('RecurringPlan', recurringPlanSchema);
