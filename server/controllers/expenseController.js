const Expense = require('../models/Expense');
const Farm = require('../models/Farm');
const Harvest = require('../models/Harvest');

const checkFarmOwner = async (farmId, userId) => {
  const farm = await Farm.findById(farmId);
  return farm && farm.userId.toString() === userId.toString();
};

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = async (req, res, next) => {
  try {
    let farmIds = [];

    if (req.user.role === 'Farmer') {
      const farms = await Farm.find({ userId: req.user._id });
      farmIds = farms.map(f => f._id);
    } else {
      const farms = await Farm.find({});
      farmIds = farms.map(f => f._id);
    }

    const expenses = await Expense.find({ farmId: { $in: farmIds } })
      .populate('farmId', 'farmName')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create an expense
// @route   POST /api/expenses
// @access  Private (Farmer)
exports.createExpense = async (req, res, next) => {
  try {
    const { farmId, category, amount, description, date } = req.body;

    const isOwner = await checkFarmOwner(farmId, req.user._id);
    if (!isOwner) {
      res.statusCode = 403;
      throw new Error('Not authorized to add expense to this farm');
    }

    const expense = await Expense.create({
      farmId,
      category,
      amount,
      description,
      date
    });

    res.status(201).json({
      success: true,
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private (Farmer)
exports.updateExpense = async (req, res, next) => {
  try {
    let expense = await Expense.findById(req.params.id);

    if (!expense) {
      res.statusCode = 404;
      throw new Error('Expense record not found');
    }

    const isOwner = await checkFarmOwner(expense.farmId, req.user._id);
    if (!isOwner) {
      res.statusCode = 403;
      throw new Error('Not authorized to update this expense record');
    }

    expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private (Farmer)
exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      res.statusCode = 404;
      throw new Error('Expense record not found');
    }

    const isOwner = await checkFarmOwner(expense.farmId, req.user._id);
    if (!isOwner) {
      res.statusCode = 403;
      throw new Error('Not authorized to delete this expense record');
    }

    await expense.deleteOne();

    res.json({
      success: true,
      message: 'Expense record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get financial analytics (revenue vs expenses, profit and category breakdown)
// @route   GET /api/expenses/analytics
// @access  Private
exports.getFinancialAnalytics = async (req, res, next) => {
  try {
    let farmIds = [];
    const farms = await Farm.find({ userId: req.user._id });
    farmIds = farms.map(f => f._id);

    // Get all expenses and harvests for these farms
    const expenses = await Expense.find({ farmId: { $in: farmIds } });
    const harvests = await Harvest.find({ farmId: { $in: farmIds } });

    // 1. Calculate category-wise breakdown
    const categoryBreakdown = {
      Seeds: 0,
      Fertilizer: 0,
      Labor: 0,
      Equipment: 0,
      Miscellaneous: 0
    };

    let totalExpenses = 0;
    expenses.forEach(exp => {
      if (categoryBreakdown[exp.category] !== undefined) {
        categoryBreakdown[exp.category] += exp.amount;
      } else {
        categoryBreakdown['Miscellaneous'] += exp.amount;
      }
      totalExpenses += exp.amount;
    });

    // Format category breakdown for charts (Pie Chart)
    const formattedCategoryData = Object.keys(categoryBreakdown).map(key => ({
      name: key,
      value: categoryBreakdown[key]
    }));

    // 2. Calculate monthly breakdown
    // Map of Month Year string e.g. "Jan 2026"
    const monthlyDataMap = {};

    expenses.forEach(exp => {
      const date = new Date(exp.date);
      const monthStr = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const key = `${monthStr} ${year}`;

      if (!monthlyDataMap[key]) {
        monthlyDataMap[key] = { month: key, expenses: 0, revenue: 0, profit: 0 };
      }
      monthlyDataMap[key].expenses += exp.amount;
    });

    let totalRevenue = 0;
    harvests.forEach(harv => {
      const date = new Date(harv.date || harv.createdAt);
      const monthStr = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const key = `${monthStr} ${year}`;

      if (!monthlyDataMap[key]) {
        monthlyDataMap[key] = { month: key, expenses: 0, revenue: 0, profit: 0 };
      }
      monthlyDataMap[key].revenue += harv.totalRevenue || 0;
      totalRevenue += harv.totalRevenue || 0;
    });

    // Calculate profit and map to final array
    const monthlyFinancials = Object.values(monthlyDataMap).map(item => {
      item.profit = item.revenue - item.expenses;
      return item;
    });

    // Sort by chronological order (approximate sorting)
    monthlyFinancials.sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA - dateB;
    });

    res.json({
      success: true,
      summary: {
        totalExpenses,
        totalRevenue,
        netProfit: totalRevenue - totalExpenses
      },
      categoryData: formattedCategoryData,
      monthlyData: monthlyFinancials
    });
  } catch (error) {
    next(error);
  }
};
