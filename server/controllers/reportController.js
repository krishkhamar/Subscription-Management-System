const Subscription = require('../models/Subscription');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');

// @desc    Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const totalSubscriptions = await Subscription.countDocuments();
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    const totalInvoices = await Invoice.countDocuments();
    const paidInvoices = await Invoice.countDocuments({ status: 'paid' });
    const overdueInvoices = await Invoice.countDocuments({ 
      status: { $in: ['draft', 'confirmed'] }, 
      dueDate: { $lt: new Date() } 
    });

    const revenueResult = await Payment.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    res.json({
      totalSubscriptions,
      activeSubscriptions,
      totalInvoices,
      paidInvoices,
      overdueInvoices,
      totalRevenue
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Revenue report
const getRevenueReport = async (req, res) => {
  try {
    const revenue = await Payment.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$paymentDate' } },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);
    res.json(revenue);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Subscription report
const getSubscriptionReport = async (req, res) => {
  try {
    const statusCounts = await Subscription.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    res.json(statusCounts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Overdue invoices
const getOverdueInvoices = async (req, res) => {
  try {
    const overdueInvoices = await Invoice.find({
      status: { $in: ['draft', 'confirmed'] },
      dueDate: { $lt: new Date() }
    })
      .populate('customer', 'name email')
      .populate('subscription', 'subscriptionNumber')
      .sort({ dueDate: 1 });
    res.json(overdueInvoices);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getDashboardStats, getRevenueReport, getSubscriptionReport, getOverdueInvoices };
