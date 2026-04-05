const mongoose = require('mongoose');

const orderLineSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  taxes: {
    type: Number,
    default: 0
  },
  amount: {
    type: Number,
    required: true
  }
});

const subscriptionSchema = new mongoose.Schema({
  subscriptionNumber: {
    type: String,
    unique: true,
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecurringPlan',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  expirationDate: {
    type: Date,
    required: true
  },
  paymentTerms: {
    type: String,
    trim: true
  },
  paymentMethod: {
    type: String,
    trim: true
  },
  paymentDone: {
    type: Boolean,
    default: false
  },
  orderLines: [orderLineSchema],
  status: {
    type: String,
    enum: ['draft', 'quotation', 'confirmed', 'active', 'closed'],
    default: 'draft'
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  salesperson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  nextBillingDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Auto-generate subscription number before saving
subscriptionSchema.pre('validate', async function (next) {
  if (!this.subscriptionNumber) {
    const count = await mongoose.model('Subscription').countDocuments();
    this.subscriptionNumber = `SUB-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
