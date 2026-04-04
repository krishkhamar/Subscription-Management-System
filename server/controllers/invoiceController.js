const Invoice = require('../models/Invoice');
const sendEmail = require('../utils/sendEmail');
const {
  buildInvoicePayloadFromSubscription,
  incrementDiscountUsage
} = require('../utils/buildInvoiceFromSubscription');

const clientBaseUrl = () =>
  process.env.CLIENT_URL || 'http://localhost:3000';

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
    if (
      req.user.role === 'portal' &&
      invoice.customer._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create invoice from subscription
const createInvoice = async (req, res) => {
  try {
    const { subscriptionId, dueDate } = req.body;
    if (!dueDate) {
      return res.status(400).json({ message: 'dueDate is required' });
    }

    const built = await buildInvoicePayloadFromSubscription(
      subscriptionId,
      new Date(dueDate),
      req.user._id
    );
    if (built.error) {
      return res.status(404).json({ message: built.error });
    }

    const invoice = await Invoice.create(built.payload);
    await incrementDiscountUsage(built.appliedDiscountIds);

    const subscription = built.subscription;
    if (subscription.customer && subscription.customer.email) {
      const invoiceUrl = `${clientBaseUrl()}/invoices?highlight=${invoice._id}`;
      const htmlTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px; color: #334155;">
          <h2 style="color: #2563eb; margin-top: 0;">New Invoice: ${invoice.invoiceNumber}</h2>
          <p>Hello <strong>${subscription.customer.name}</strong>,</p>
          <p>A new invoice has been generated for your subscription.</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0;">
            <p style="margin: 0; font-size: 18px;"><strong>Amount Due:</strong> $${invoice.totalAmount.toFixed(2)}</p>
            <p style="margin: 5px 0 0 0;"><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
          </div>

          <div style="margin: 15px 0;">
            <p style="margin: 0; font-size: 14px;">Subtotal: $${invoice.subtotal.toFixed(2)}</p>
            <p style="margin: 0; font-size: 14px; color: #ef4444;">Discount: -$${invoice.totalDiscount.toFixed(2)}</p>
            <p style="margin: 0; font-size: 14px;">Tax: +$${invoice.totalTax.toFixed(2)}</p>
          </div>
          
          <p>Please log securely into your portal to process payment.</p>
          <a href="${invoiceUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">View & Pay Invoice</a>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 30px; margin-bottom: 20px;">
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">
            Subscription Management System - Automated Billing
          </p>
        </div>
      `;

      sendEmail({
        to: subscription.customer.email,
        subject: `Invoice ${invoice.invoiceNumber} is Due`,
        html: htmlTemplate
      }).catch((err) => console.error('Email send failed:', err));
    }

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

// @desc    Send invoice email manually
const sendInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('lines.product', 'productName');
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Invoice ${invoice.invoiceNumber}</h2>
        <p>Hello ${invoice.customer.name},</p>
        <p><strong>Amount due:</strong> $${invoice.totalAmount.toFixed(2)}</p>
        <p><strong>Due:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
        <p><strong>Status:</strong> ${invoice.status}</p>
        <p><a href="${clientBaseUrl()}/invoices">Open invoices in portal</a></p>
      </div>`;

    await sendEmail({
      to: invoice.customer.email,
      subject: `Your Invoice ${invoice.invoiceNumber}`,
      html: htmlTemplate
    });

    res.json({ message: 'Invoice sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get print-ready invoice data
const printInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('lines.product', 'productName');
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    if (
      req.user.role === 'portal' &&
      invoice.customer._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({
      message: 'Print data fetched',
      invoice
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoiceStatus,
  sendInvoice,
  printInvoice
};
