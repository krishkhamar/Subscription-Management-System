const QuotationTemplate = require('../models/QuotationTemplate');

// @desc    Get all templates
const getTemplates = async (req, res) => {
  try {
    const templates = await QuotationTemplate.find()
      .populate('recurringPlan', 'planName')
      .populate('productLines.product', 'productName salesPrice');
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single template
const getTemplate = async (req, res) => {
  try {
    const template = await QuotationTemplate.findById(req.params.id)
      .populate('recurringPlan')
      .populate('productLines.product');
    if (!template) return res.status(404).json({ message: 'Template not found' });
    res.json(template);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create template
const createTemplate = async (req, res) => {
  try {
    const template = await QuotationTemplate.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update template
const updateTemplate = async (req, res) => {
  try {
    const template = await QuotationTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!template) return res.status(404).json({ message: 'Template not found' });
    res.json(template);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete template
const deleteTemplate = async (req, res) => {
  try {
    const template = await QuotationTemplate.findByIdAndDelete(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template not found' });
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getTemplates, getTemplate, createTemplate, updateTemplate, deleteTemplate };
