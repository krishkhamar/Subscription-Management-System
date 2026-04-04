const express = require('express');
const router = express.Router();
const { getTaxes, getTax, createTax, updateTax, deleteTax } = require('../controllers/taxController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getTaxes)
  .post(protect, authorize('admin'), createTax);

router.route('/:id')
  .get(protect, getTax)
  .put(protect, authorize('admin'), updateTax)
  .delete(protect, authorize('admin'), deleteTax);

module.exports = router;
