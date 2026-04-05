const express = require('express');
const router = express.Router();
const { 
  getPayments, 
  createPayment, 
  createRazorpayOrder, 
  verifyRazorpayPayment,
  getPaymentConfig
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getPayments)
  .post(protect, authorize('admin', 'internal', 'portal'), createPayment);

router.get('/config', protect, getPaymentConfig);
router.post('/razorpay/order', protect, authorize('admin', 'internal', 'portal'), createRazorpayOrder);
router.post('/razorpay/verify', protect, authorize('admin', 'internal', 'portal'), verifyRazorpayPayment);

module.exports = router;
