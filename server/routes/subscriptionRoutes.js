const express = require('express');
const router = express.Router();
const { getSubscriptions, getSubscription, createSubscription, updateSubscription, updateSubscriptionStatus } = require('../controllers/subscriptionController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getSubscriptions)
  .post(protect, authorize('admin', 'internal'), createSubscription);

router.route('/:id')
  .get(protect, getSubscription)
  .put(protect, authorize('admin', 'internal'), updateSubscription);

router.put('/:id/status', protect, authorize('admin', 'internal'), updateSubscriptionStatus);

module.exports = router;
