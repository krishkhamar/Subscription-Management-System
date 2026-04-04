const Invoice = require('../models/Invoice');
const Subscription = require('../models/Subscription');

// @desc    Get all invoices
const getInvoices = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'portal') {
      filter.customer = req.user._id;
    }
    const invoices = await Invoice.find(filter)
      .populate('customer', 'name email')
      .populate('subscription', 'subscriptionNumber')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single invoice
const getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('subscription', 'subscriptionNumber plan')
      .populate('lines.product', 'productName');
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create invoice from subscription
const createInvoice = async (req, res) => {
  try {
    const { subscriptionId, dueDate } = req.body;
    const subscription = await Subscription.findById(subscriptionId).populate('orderLines.product');
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Build invoice lines from subscription order lines
    const lines = subscription.orderLines.map(line => ({
      product: line.product,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      taxAmount: line.taxes || 0,
      discountAmount: 0,
      lineTotal: line.amount
    }));

    const subtotal = lines.reduce((sum, l) => sum + (l.unitPrice * l.quantity), 0);
    const totalTax = lines.reduce((sum, l) => sum + l.taxAmount, 0);
    const totalAmount = subtotal + totalTax;

    const invoice = await Invoice.create({
      subscription: subscriptionId,
      customer: subscription.customer,
      dueDate,
      lines,
      subtotal,
      totalTax,
      totalAmount,
      createdBy: req.user._id
    });

    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update invoice status
const updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validTransitions = {
      draft: ['confirmed', 'cancelled'],
      confirmed: ['paid', 'cancelled'],
      paid: [],
      cancelled: []
    };

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    if (!validTransitions[invoice.status]?.includes(status)) {
      return res.status(400).json({ 
        message: `Cannot transition from '${invoice.status}' to '${status}'` 
      });
    }

    invoice.status = status;
    await invoice.save();
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getInvoices, getInvoice, createInvoice, updateInvoiceStatus };
