const cron = require('node-cron');
const Subscription = require('../models/Subscription');
const Invoice = require('../models/Invoice');
const sendEmail = require('./sendEmail');

const initCronJobs = () => {
  // Run every day at midnight: '0 0 * * *'
  cron.schedule('0 0 * * *', async () => {
    console.log('--- Running Autonomous Billing Logic ---');
    try {
      const now = new Date();
      
      // Find active subscriptions that are due for billing
      const dueSubscriptions = await Subscription.find({
        status: 'active',
        nextBillingDate: { $lte: now }
      }).populate('customer', 'name email');

      for (const sub of dueSubscriptions) {
        console.log(`Processing Billing for Subscription: ${sub.subscriptionNumber}`);

        // 1. Create the Invoice
        const invoice = await Invoice.create({
          subscription: sub._id,
          customer: sub.customer._id,
          dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
          totalAmount: sub.totalAmount,
          orderLines: sub.orderLines.map(line => ({
            product: line.product,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            taxes: line.taxes,
            amount: line.amount
          })),
          status: 'draft'
        });

        // 2. Calculate the next billing date
        const nextDate = new Date(sub.nextBillingDate);
        // We'll need the plan to know how much to add. 
        // For simplicity in this hackathon logic, we assume monthly if lookup fails, 
        // but let's try to do it right.
        const populatedSub = await Subscription.findById(sub._id).populate('plan');
        const period = populatedSub.plan.billingPeriod;

        if (period === 'daily') nextDate.setDate(nextDate.getDate() + 1);
        else if (period === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
        else if (period === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
        else if (period === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);

        sub.nextBillingDate = nextDate;
        await sub.save();

        // 3. Send Email Notification
        if (sub.customer.email) {
          const htmlTemplate = `
            <div style="font-family: Arial, sans-serif; color: #334155;">
              <h2 style="color: #2563eb;">Autonomous Billing: New Invoice ${invoice.invoiceNumber}</h2>
              <p>Hello ${sub.customer.name},</p>
              <p>Your subscription <strong>${sub.subscriptionNumber}</strong> has been automatically billed for the next period.</p>
              <p><strong>Amount:</strong> $${invoice.totalAmount.toFixed(2)}</p>
              <p>Please log in to your portal to complete the payment.</p>
            </div>
          `;
          sendEmail({
            to: sub.customer.email,
            subject: `Automated Invoice ${invoice.invoiceNumber} Generated`,
            html: htmlTemplate
          }).catch(err => console.error('Cron Email Error:', err));
        }

        console.log(`Successfully billed ${sub.subscriptionNumber}. Next billing: ${sub.nextBillingDate}`);
      }
    } catch (error) {
      console.error('Cron Job Error:', error);
    }
  });
};

module.exports = initCronJobs;
