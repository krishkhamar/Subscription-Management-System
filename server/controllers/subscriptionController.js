const Subscription = require('../models/Subscription');

// @desc    Get all subscriptions
const getSubscriptions = async (req, res) => {
  try {
    const filter = {};
    // Portal users can only see their own subscriptions
    if (req.user.role === 'portal') {
      filter.customer = req.user._id;
    }
    const subscriptions = await Subscription.find(filter)
      .populate('customer', 'name email')
      .populate('plan', 'planName billingPeriod price')
      .populate('orderLines.product', 'productName');
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single subscription
const getSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('plan', 'planName billingPeriod price')
      .populate('orderLines.product', 'productName salesPrice');
    if (!subscription) return res.status(404).json({ message: 'Subscription not found' });
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create subscription
const createSubscription = async (req, res) => {
  try {
    // Calculate total amount from order lines
    const orderLines = req.body.orderLines || [];
    const totalAmount = orderLines.reduce((sum, line) => sum + (line.amount || 0), 0);

    const subscription = await Subscription.create({
      ...req.body,
      totalAmount,
      createdBy: req.user._id
    });
    res.status(201).json(subscription);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update subscription
const updateSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!subscription) return res.status(404).json({ message: 'Subscription not found' });
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update subscription status
// @route   PUT /api/subscriptions/:id/status
const updateSubscriptionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validTransitions = {
      draft: ['quotation'],
      quotation: ['confirmed', 'draft'],
      confirmed: ['active'],
      active: ['closed'],
      closed: []
    };

    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) return res.status(404).json({ message: 'Subscription not found' });

    if (!validTransitions[subscription.status]?.includes(status)) {
      return res.status(400).json({ 
        message: `Cannot transition from '${subscription.status}' to '${status}'` 
      });
    }

    subscription.status = status;

    // If activated, set the next billing date based on the plan
    if (status === 'active') {
      const populatedSub = await Subscription.findById(subscription._id).populate('plan');
      const period = populatedSub.plan.billingPeriod;
      const nextDate = new Date(); // Start billing cycle from today

      if (period === 'daily') nextDate.setDate(nextDate.getDate() + 1);
      else if (period === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
      else if (period === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
      else if (period === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);

      subscription.nextBillingDate = nextDate;
    }

    await subscription.save();
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getSubscriptions, getSubscription, createSubscription, updateSubscription, updateSubscriptionStatus };
