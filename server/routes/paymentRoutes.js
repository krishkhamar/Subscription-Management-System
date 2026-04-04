const express = require('express');
const router = express.Router();
const { getPayments, createPayment } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getPayments)
  .post(protect, authorize('admin', 'internal'), createPayment);

module.exports = router;
