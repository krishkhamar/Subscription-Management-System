const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');

// @desc    Get all payments
const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: 'invoice',
        select: 'invoiceNumber totalAmount status',
        populate: { path: 'customer', select: 'name email' }
      })
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create payment
const createPayment = async (req, res) => {
  try {
    const { invoice: invoiceId, paymentMethod, amount, paymentDate, notes } = req.body;

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    if (invoice.status === 'paid') return res.status(400).json({ message: 'Invoice is already paid' });
    if (invoice.status !== 'confirmed') return res.status(400).json({ message: 'Invoice must be confirmed before payment' });

    const payment = await Payment.create({
      invoice: invoiceId,
      paymentMethod,
      amount,
      paymentDate,
      notes,
      createdBy: req.user._id
    });

    // Mark invoice as paid if full amount received
    if (amount >= invoice.totalAmount) {
      invoice.status = 'paid';
      await invoice.save();
    }

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getPayments, createPayment };
