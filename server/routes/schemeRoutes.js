const express = require('express');
const router = express.Router();
const {
  getSchemes,
  getScheme,
  createScheme,
  updateScheme,
  deleteScheme
} = require('../controllers/schemeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getSchemes)
  .post(protect, authorize('Admin'), createScheme);

router.route('/:id')
  .get(protect, getScheme)
  .put(protect, authorize('Admin'), updateScheme)
  .delete(protect, authorize('Admin'), deleteScheme);

module.exports = router;
