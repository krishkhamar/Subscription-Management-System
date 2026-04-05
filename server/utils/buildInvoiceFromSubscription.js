const Subscription = require('../models/Subscription');
const Tax = require('../models/Tax');
const Discount = require('../models/Discount');

function productInDiscount(discount, productId) {
  if (!discount.products?.length) return false;
  const pid = productId?.toString();
  return discount.products.some((p) => p.toString() === pid);
}

/**
 * Build invoice line items and totals from a subscription (tax + discounts).
 * Respects discount limitUsage (0 = unlimited).
 */
async function buildInvoicePayloadFromSubscription(subscriptionId, dueDate, createdBy) {
  const subscription = await Subscription.findById(subscriptionId).populate(
    'customer',
    'name email'
  );

  if (!subscription) {
    return { error: 'Subscription not found' };
  }

  const activeTaxes = await Tax.find({ isActive: true });
  const now = new Date();
  const activeDiscounts = await Discount.find({
    startDate: { $lte: now },
    endDate: { $gte: now }
  });

  const usableDiscounts = activeDiscounts.filter(
    (d) => !d.limitUsage || d.limitUsage === 0 || d.usedCount < d.limitUsage
  );

  const taxRate = activeTaxes.reduce(
    (sum, t) => sum + (t.type === 'percentage' ? t.rate : 0),
    0
  );

  let totalTax = 0;
  let totalDiscount = 0;
  let subtotal = 0;
  const appliedDiscountIds = new Set();

  const lines = subscription.orderLines.map((line) => {
    const lineSubtotal = line.unitPrice * line.quantity;

    let lineDiscount = 0;
    const applicableDiscount = usableDiscounts.find((d) => {
      const qtyOk = !d.minimumQuantity || line.quantity >= d.minimumQuantity;
      if (!qtyOk) return false;
      if (d.appliesTo === 'products' && productInDiscount(d, line.product)) {
        return lineSubtotal >= (d.minimumPurchase || 0);
      }
      if (d.appliesTo === 'subscriptions') {
        return lineSubtotal >= (d.minimumPurchase || 0);
      }
      return false;
    });

    if (applicableDiscount) {
      lineDiscount =
        applicableDiscount.type === 'percentage'
          ? (lineSubtotal * applicableDiscount.value) / 100
          : applicableDiscount.value;
      appliedDiscountIds.add(applicableDiscount._id.toString());
    }

    const discountedAmount = lineSubtotal - lineDiscount;
    const lineTax = (discountedAmount * taxRate) / 100;

    subtotal += lineSubtotal;
    totalDiscount += lineDiscount;
    totalTax += lineTax;

    return {
      product: line.product,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      taxAmount: lineTax,
      discountAmount: lineDiscount,
      lineTotal: discountedAmount + lineTax
    };
  });

  const totalAmount = subtotal - totalDiscount + totalTax;

  const payload = {
    subscription: subscriptionId,
    customer: subscription.customer._id || subscription.customer,
    dueDate,
    lines,
    subtotal,
    totalTax,
    totalDiscount,
    totalAmount
  };
  if (subscription.salesperson) payload.salesperson = subscription.salesperson;
  if (createdBy) payload.createdBy = createdBy;

  return {
    subscription,
    payload,
    appliedDiscountIds: [...appliedDiscountIds]
  };
}

async function incrementDiscountUsage(discountIds) {
  if (!discountIds?.length) return;
  await Promise.all(
    discountIds.map((id) =>
      Discount.findByIdAndUpdate(id, { $inc: { usedCount: 1 } })
    )
  );
}

module.exports = {
  buildInvoicePayloadFromSubscription,
  incrementDiscountUsage
};
