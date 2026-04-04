const express = require('express');
const router = express.Router();
const { getInvoices, getInvoice, createInvoice, updateInvoiceStatus } = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getInvoices)
  .post(protect, authorize('admin', 'internal'), createInvoice);

router.route('/:id')
  .get(protect, getInvoice);

router.put('/:id/status', protect, authorize('admin', 'internal'), updateInvoiceStatus);

module.exports = router;
