const express = require('express');
const router = express.Router();
const { getTemplates, getTemplate, createTemplate, updateTemplate, deleteTemplate } = require('../controllers/quotationTemplateController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getTemplates)
  .post(protect, authorize('admin'), createTemplate);

router.route('/:id')
  .get(protect, getTemplate)
  .put(protect, authorize('admin'), updateTemplate)
  .delete(protect, authorize('admin'), deleteTemplate);

module.exports = router;
