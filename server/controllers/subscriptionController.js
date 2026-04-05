const Subscription = require('../models/Subscription');
const Invoice = require('../models/Invoice');
const {
  buildInvoicePayloadFromSubscription,
  incrementDiscountUsage
} = require('../utils/buildInvoiceFromSubscription');

// @desc    Get all subscriptions
const getSubscriptions = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'portal') {
      filter.customer = req.user._id;
    }
    const subscriptions = await Subscription.find(filter)
      .populate('customer', 'name email')
      .populate('plan', 'planName billingPeriod price')
      .populate('orderLines.product', 'productName')
      .populate('salesperson', 'name email');
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
      .populate('orderLines.product', 'productName salesPrice')
      .populate('salesperson', 'name email');
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    if (
      req.user.role === 'portal' &&
      subscription.customer._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create subscription
const createSubscription = async (req, res) => {
  try {
    const orderLines = req.body.orderLines || [];
    const totalAmount = orderLines.reduce((sum, line) => sum + (line.amount || 0), 0);

    const subscription = await Subscription.create({
      ...req.body,
      totalAmount,
      createdBy: req.user._id
    });

    // Auto-generate invoice if the status is 'confirmed' (standard for portal checkouts)
    let invoiceId = null;
    if (subscription.status === 'confirmed') {
      const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const built = await buildInvoicePayloadFromSubscription(
        subscription._id,
        dueDate,
        req.user._id
      );
      if (!built.error) {
        const invoice = await Invoice.create(built.payload);
        await incrementDiscountUsage(built.appliedDiscountIds);
        invoiceId = invoice._id;
      }
    }

    res.status(201).json({
      ...subscription.toObject(),
      invoiceId
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update subscription
const updateSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!subscription) return res.status(404).json({ message: 'Subscription not found' });
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update subscription status
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

    if (status === 'active') {
      const populatedSub = await Subscription.findById(subscription._id).populate('plan');
      const period = populatedSub.plan.billingPeriod;
      const nextDate = new Date();

      if (period === 'daily') nextDate.setDate(nextDate.getDate() + 1);
      else if (period === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
      else if (period === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
      else if (period === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);

      subscription.nextBillingDate = nextDate;

      const openInvoiceCount = await Invoice.countDocuments({
        subscription: subscription._id,
        status: { $in: ['draft', 'confirmed'] }
      });

      if (openInvoiceCount === 0) {
        const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const built = await buildInvoicePayloadFromSubscription(
          subscription._id,
          dueDate,
          req.user._id
        );
        if (!built.error) {
          await Invoice.create(built.payload);
          await incrementDiscountUsage(built.appliedDiscountIds);
        }
      }
    }

    await subscription.save();
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete subscription
const deleteSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) return res.status(404).json({ message: 'Subscription not found' });
    
    // Check if there are invoices tied to this subscription before deleting
    const relatedInvoices = await Invoice.find({ subscription: req.params.id });
    if (relatedInvoices.length > 0) {
      return res.status(400).json({ message: 'Cannot delete subscription with attached invoices. Archive it instead.' });
    }

    await subscription.deleteOne();
    res.json({ message: 'Subscription deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getSubscriptions,
  getSubscription,
  createSubscription,
  updateSubscription,
  updateSubscriptionStatus,
  deleteSubscription
};
