const Subscription = require('../models/Subscription');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');

// @desc    Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const filter = {};
    const paymentFilter = {};
    
    if (req.user.role === 'portal') {
      filter.customer = req.user._id;
      // For payments, we need to filter by invoice.customer
      const userInvoices = await Invoice.find({ customer: req.user._id }).select('_id');
      paymentFilter.invoice = { $in: userInvoices.map(i => i._id) };
    }

    const totalSubscriptions = await Subscription.countDocuments(filter);
    const activeSubscriptions = await Subscription.countDocuments({ ...filter, status: 'active' });
    const totalInvoices = await Invoice.countDocuments(filter);
    const paidInvoices = await Invoice.countDocuments({ ...filter, status: 'paid' });
    const overdueInvoices = await Invoice.countDocuments({ 
      ...filter,
      status: { $in: ['draft', 'confirmed'] }, 
      dueDate: { $lt: new Date() } 
    });

    const revenueResult = await Payment.aggregate([
      { $match: paymentFilter },
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
    const { startDate, endDate } = req.query;
    const matchStage = {};
    
    if (startDate || endDate) {
      matchStage.paymentDate = {};
      if (startDate) matchStage.paymentDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchStage.paymentDate.$lte = end;
      }
    }

    const pipeline = [];
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    pipeline.push(
      {
        $group: {
          _id: { $dateToString: { format: '%m-%Y', date: '$paymentDate' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $project: { _id: 0, month: '$_id', total: 1, count: 1 } },
      { $sort: { month: -1 } }
    );

    const revenue = await Payment.aggregate(pipeline);
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
