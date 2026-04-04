const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoiceStatus,
  sendInvoice,
  printInvoice
} = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, getInvoices)
  .post(protect, authorize('admin', 'internal'), createInvoice);

router.put(
  '/:id/status',
  protect,
  authorize('admin', 'internal'),
  updateInvoiceStatus
);
router.post(
  '/:id/send',
  protect,
  authorize('admin', 'internal'),
  sendInvoice
);
router.get(
  '/:id/print',
  protect,
  authorize('admin', 'internal', 'portal'),
  printInvoice
);

router.get('/:id', protect, getInvoice);

module.exports = router;
