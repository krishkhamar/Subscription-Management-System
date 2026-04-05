const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Subscription = require('../models/Subscription');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

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
    
    // Check ownership if portal user
    if (req.user.role === 'portal' && invoice.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to pay this invoice' });
    }
    
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

// @desc    Create Razorpay Order
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    // Standard Razorpay flow
    const options = {
      amount: Math.round(amount * 100),
      currency,
      receipt: receipt || `receipt_${Date.now()}`
    };

    try {
      const order = await razorpay.orders.create(options);
      return res.json({ ...order, isMock: false });
    } catch (rzpError) {
      // Fallback to high-fidelity mock if real keys fail
      console.log('Using Mock Razorpay Order (Development Mode)');
      return res.json({
        id: `order_mock_${Date.now()}`,
        amount: options.amount,
        currency: options.currency,
        receipt: options.receipt,
        isMock: true
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Order creation failed', error: error.message });
  }
};

// @desc    Verify Razorpay Payment Signature
const verifyRazorpayPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      invoiceId,
      isMock = false 
    } = req.body;

    if (!isMock) {
      // Real Signature Verification
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ message: 'Invalid payment signature' });
      }
    } else {
        // Mock Verification logic - just check for existence
        if (!razorpay_payment_id.startsWith('pay_mock_')) {
            return res.status(400).json({ message: 'Invalid mock payment' });
        }
    }

    // proceed to record payment
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const payment = await Payment.create({
      invoice: invoiceId,
      paymentMethod: 'upi',
      amount: invoice.totalAmount,
      notes: `Verified ${isMock ? 'Mock ' : ''}Razorpay Payment: ${razorpay_payment_id}`,
      createdBy: req.user._id
    });

    // Mark invoice as paid
    invoice.status = 'paid';
    await invoice.save();

    // AUTO-ACTIVATE SUBSCRIPTION
    const subscription = await Subscription.findById(invoice.subscription).populate('plan');
    
    if (subscription && subscription.status === 'confirmed') {
      subscription.status = 'active';
      
      // Calculate next billing date
      const billingPeriod = subscription.plan?.billingPeriod || 'monthly';
      const nextDate = new Date();
      if (billingPeriod === 'daily') nextDate.setDate(nextDate.getDate() + 1);
      else if (billingPeriod === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
      else if (billingPeriod === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
      else if (billingPeriod === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);
      
      subscription.nextBillingDate = nextDate;
      await subscription.save();
      console.log(`Subscription ${subscription.subscriptionNumber} auto-activated on payment.`);
    }

    res.json({ message: 'Payment verified successfully', payment });
  } catch (error) {
    res.status(500).json({ message: 'Verification error', error: error.message });
  }
};

// @desc    Get public payment config
const getPaymentConfig = async (req, res) => {
  res.json({
    razorpayKeyId: process.env.RAZORPAY_KEY_ID
  });
};

module.exports = { getPayments, createPayment, createRazorpayOrder, verifyRazorpayPayment, getPaymentConfig };
