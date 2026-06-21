const express = require('express');
const router = express.Router();
const {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getFinancialAnalytics
} = require('../controllers/expenseController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/analytics', protect, getFinancialAnalytics);

router.route('/')
  .get(protect, getExpenses)
  .post(protect, authorize('Farmer'), createExpense);

router.route('/:id')
  .put(protect, authorize('Farmer'), updateExpense)
  .delete(protect, authorize('Farmer'), deleteExpense);

module.exports = router;
