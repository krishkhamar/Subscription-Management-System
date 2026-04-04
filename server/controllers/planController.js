const RecurringPlan = require('../models/RecurringPlan');

// @desc    Get all plans
const getPlans = async (req, res) => {
  try {
    const plans = await RecurringPlan.find().populate('createdBy', 'name email');
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single plan
const getPlan = async (req, res) => {
  try {
    const plan = await RecurringPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create plan
const createPlan = async (req, res) => {
  try {
    const plan = await RecurringPlan.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update plan
const updatePlan = async (req, res) => {
  try {
    const plan = await RecurringPlan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete plan
const deletePlan = async (req, res) => {
  try {
    const plan = await RecurringPlan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getPlans, getPlan, createPlan, updatePlan, deletePlan };
