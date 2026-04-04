const express = require('express');
const router = express.Router();
const { getDashboardStats, getRevenueReport, getSubscriptionReport, getOverdueInvoices } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, authorize('admin', 'internal', 'portal'), getDashboardStats);
router.get('/revenue', protect, authorize('admin', 'internal'), getRevenueReport);
router.get('/subscriptions', protect, authorize('admin', 'internal'), getSubscriptionReport);
router.get('/overdue-invoices', protect, authorize('admin', 'internal'), getOverdueInvoices);

module.exports = router;
