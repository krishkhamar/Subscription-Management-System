const mongoose = require('mongoose');

const templateLineSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true
  }
});

const quotationTemplateSchema = new mongoose.Schema({
  templateName: {
    type: String,
    required: [true, 'Template name is required'],
    trim: true
  },
  validityDays: {
    type: Number,
    required: true,
    min: 1
  },
  recurringPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecurringPlan',
    required: true
  },
  productLines: [templateLineSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('QuotationTemplate', quotationTemplateSchema);
