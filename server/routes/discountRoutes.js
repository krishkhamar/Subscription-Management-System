const express = require('express');
const router = express.Router();
const { getDiscounts, getDiscount, createDiscount, updateDiscount, deleteDiscount } = require('../controllers/discountController');
const { protect, authorize } = require('../middleware/auth');

// Only admin can manage discounts
router.route('/')
  .get(protect, getDiscounts)
  .post(protect, authorize('admin'), createDiscount);

router.route('/:id')
  .get(protect, getDiscount)
  .put(protect, authorize('admin'), updateDiscount)
  .delete(protect, authorize('admin'), deleteDiscount);

module.exports = router;
