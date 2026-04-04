const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
  discountName: {
    type: String,
    required: [true, 'Discount name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['fixed', 'percentage'],
    required: [true, 'Discount type is required']
  },
  value: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: 0
  },
  minimumPurchase: {
    type: Number,
    default: 0
  },
  minimumQuantity: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  limitUsage: {
    type: Number,
    default: 0 // 0 = unlimited
  },
  usedCount: {
    type: Number,
    default: 0
  },
  appliesTo: {
    type: String,
    enum: ['products', 'subscriptions'],
    required: true
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Discount', discountSchema);
