const express = require('express');
const router = express.Router();
const { getSubscriptions, getSubscription, createSubscription, updateSubscription, updateSubscriptionStatus, deleteSubscription } = require('../controllers/subscriptionController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getSubscriptions)
  .post(protect, authorize('admin', 'internal', 'portal'), createSubscription);

router.route('/:id')
  .get(protect, getSubscription)
  .put(protect, authorize('admin', 'internal'), updateSubscription)
  .delete(protect, authorize('admin', 'internal'), deleteSubscription);

router.put('/:id/status', protect, authorize('admin', 'internal'), updateSubscriptionStatus);

module.exports = router;
