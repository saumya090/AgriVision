const User = require('../models/User');
const Farm = require('../models/Farm');
const Crop = require('../models/Crop');
const Harvest = require('../models/Harvest');
const Product = require('../models/Product');

// @desc    Get global platform stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getPlatformStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFarms = await Farm.countDocuments();
    const totalCrops = await Crop.countDocuments();
    const totalProducts = await Product.countDocuments();

    // Sum up all harvests revenue
    const harvests = await Harvest.find({});
    const totalRevenue = harvests.reduce((acc, curr) => acc + (curr.totalRevenue || 0), 0);

    // Dynamic stats: crops distribution
    const activeCrops = await Crop.countDocuments({ status: 'Active' });
    const plannedCrops = await Crop.countDocuments({ status: 'Planned' });
    const harvestedCrops = await Crop.countDocuments({ status: 'Harvested' });

    // User breakdown
    const farmersCount = await User.countDocuments({ role: 'Farmer' });
    const adminsCount = await User.countDocuments({ role: 'Admin' });

    // Let's aggregate monthly system-wide revenues vs listings for admin charts
    // Let's construct a timeline of user registrations and listings if needed, or simple summaries
    res.json({
      success: true,
      stats: {
        totalUsers,
        totalFarms,
        totalCrops,
        totalRevenue,
        totalProducts,
        cropsBreakdown: {
          active: activeCrops,
          planned: plannedCrops,
          harvested: harvestedCrops
        },
        usersBreakdown: {
          farmers: farmersCount,
          admins: adminsCount
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.statusCode = 404;
      throw new Error('User not found');
    }

    // Do not let admin delete themselves
    if (user._id.toString() === req.user._id.toString()) {
      res.statusCode = 400;
      throw new Error('You cannot delete your own admin account');
    }

    // Cascade delete user data
    const userFarms = await Farm.find({ userId: user._id });
    const farmIds = userFarms.map(f => f._id);

    // Delete associated farm details
    await Crop.deleteMany({ farmId: { $in: farmIds } });
    await Irrigation.deleteMany({ farmId: { $in: farmIds } });
    await Harvest.deleteMany({ farmId: { $in: farmIds } });
    await Product.deleteMany({ farmerId: user._id });

    // Delete farms
    await Farm.deleteMany({ userId: user._id });

    // Delete the user
    await user.deleteOne();

    res.json({
      success: true,
      message: 'User and all related assets deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
