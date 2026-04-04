const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  attribute: { type: String, required: true, trim: true },
  value: { type: String, required: true, trim: true },
  extraPrice: { type: Number, default: 0 }
});

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  productType: {
    type: String,
    required: [true, 'Product type is required'],
    trim: true
  },
  salesPrice: {
    type: Number,
    required: [true, 'Sales price is required'],
    min: 0
  },
  costPrice: {
    type: Number,
    required: [true, 'Cost price is required'],
    min: 0
  },
  variants: [variantSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
