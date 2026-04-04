const Discount = require('../models/Discount');

// @desc    Get all discounts
const getDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.find().populate('products', 'productName');
    res.json(discounts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single discount
const getDiscount = async (req, res) => {
  try {
    const discount = await Discount.findById(req.params.id).populate('products', 'productName');
    if (!discount) return res.status(404).json({ message: 'Discount not found' });
    res.json(discount);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create discount (Admin only)
const createDiscount = async (req, res) => {
  try {
    const discount = await Discount.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(discount);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update discount
const updateDiscount = async (req, res) => {
  try {
    const discount = await Discount.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!discount) return res.status(404).json({ message: 'Discount not found' });
    res.json(discount);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete discount
const deleteDiscount = async (req, res) => {
  try {
    const discount = await Discount.findByIdAndDelete(req.params.id);
    if (!discount) return res.status(404).json({ message: 'Discount not found' });
    res.json({ message: 'Discount deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getDiscounts, getDiscount, createDiscount, updateDiscount, deleteDiscount };
