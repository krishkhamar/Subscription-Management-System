const cron = require('node-cron');
const Subscription = require('../models/Subscription');
const Invoice = require('../models/Invoice');
const sendEmail = require('./sendEmail');
const {
  buildInvoicePayloadFromSubscription,
  incrementDiscountUsage
} = require('./buildInvoiceFromSubscription');

const clientBaseUrl = () =>
  process.env.CLIENT_URL || 'http://localhost:3000';

const initCronJobs = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('--- Running Autonomous Billing Logic ---');
    try {
      const now = new Date();

      const dueSubscriptions = await Subscription.find({
        status: 'active',
        nextBillingDate: { $lte: now }
      }).populate('customer', 'name email');

      for (const sub of dueSubscriptions) {
        console.log(`Processing Billing for Subscription: ${sub.subscriptionNumber}`);

        const dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const built = await buildInvoicePayloadFromSubscription(
          sub._id,
          dueDate,
          null
        );

        if (built.error) {
          console.error('Cron: could not build invoice', built.error);
          continue;
        }

        const invoice = await Invoice.create(built.payload);
        await incrementDiscountUsage(built.appliedDiscountIds);

        const populatedSub = await Subscription.findById(sub._id).populate('plan');
        const period = populatedSub.plan?.billingPeriod;
        const nextDate = new Date(sub.nextBillingDate);

        if (period === 'daily') nextDate.setDate(nextDate.getDate() + 1);
        else if (period === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
        else if (period === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
        else if (period === 'yearly')
          nextDate.setFullYear(nextDate.getFullYear() + 1);

        sub.nextBillingDate = nextDate;
        await sub.save();

        if (sub.customer?.email) {
          const htmlTemplate = `
            <div style="font-family: Arial, sans-serif; color: #334155;">
              <h2 style="color: #2563eb;">Autonomous Billing: New Invoice ${invoice.invoiceNumber}</h2>
              <p>Hello ${sub.customer.name},</p>
              <p>Your subscription <strong>${sub.subscriptionNumber}</strong> has been automatically billed for the next period.</p>
              <p><strong>Amount:</strong> $${invoice.totalAmount.toFixed(2)}</p>
              <p><a href="${clientBaseUrl()}/invoices">View invoices</a></p>
            </div>
          `;
          sendEmail({
            to: sub.customer.email,
            subject: `Automated Invoice ${invoice.invoiceNumber} Generated`,
            html: htmlTemplate
          }).catch((err) => console.error('Cron Email Error:', err));
        }

        console.log(
          `Successfully billed ${sub.subscriptionNumber}. Next billing: ${sub.nextBillingDate}`
        );
      }
    } catch (error) {
      console.error('Cron Job Error:', error);
    }
  });
};

module.exports = initCronJobs;
