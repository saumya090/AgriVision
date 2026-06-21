const Irrigation = require('../models/Irrigation');
const Farm = require('../models/Farm');

const checkFarmOwner = async (farmId, userId) => {
  const farm = await Farm.findById(farmId);
  return farm && farm.userId.toString() === userId.toString();
};

// @desc    Get all irrigation tasks/logs for user
// @route   GET /api/irrigation
// @access  Private
exports.getIrrigations = async (req, res, next) => {
  try {
    let farmIds = [];

    if (req.user.role === 'Farmer') {
      const farms = await Farm.find({ userId: req.user._id });
      farmIds = farms.map(f => f._id);
    } else {
      const farms = await Farm.find({});
      farmIds = farms.map(f => f._id);
    }

    const irrigations = await Irrigation.find({ farmId: { $in: farmIds } })
      .populate('farmId', 'farmName')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: irrigations.length,
      data: irrigations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get irrigation records for a single farm
// @route   GET /api/irrigation/farm/:farmId
// @access  Private
exports.getIrrigationByFarm = async (req, res, next) => {
  try {
    const isOwner = await checkFarmOwner(req.params.farmId, req.user._id);
    if (req.user.role !== 'Admin' && !isOwner) {
      res.statusCode = 403;
      throw new Error('Not authorized to access irrigation data for this farm');
    }

    const records = await Irrigation.find({ farmId: req.params.farmId }).sort({ date: -1 });

    res.json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create irrigation schedule/log
// @route   POST /api/irrigation
// @access  Private (Farmer)
exports.createIrrigation = async (req, res, next) => {
  try {
    const { farmId, date, duration, waterUsed } = req.body;

    const isOwner = await checkFarmOwner(farmId, req.user._id);
    if (!isOwner) {
      res.statusCode = 403;
      throw new Error('Not authorized to schedule irrigation for this farm');
    }

    const irrigation = await Irrigation.create({
      farmId,
      date,
      duration,
      waterUsed
    });

    res.status(201).json({
      success: true,
      data: irrigation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update irrigation record
// @route   PUT /api/irrigation/:id
// @access  Private (Farmer)
exports.updateIrrigation = async (req, res, next) => {
  try {
    let irrigation = await Irrigation.findById(req.params.id);

    if (!irrigation) {
      res.statusCode = 404;
      throw new Error('Irrigation log not found');
    }

    const isOwner = await checkFarmOwner(irrigation.farmId, req.user._id);
    if (!isOwner) {
      res.statusCode = 403;
      throw new Error('Not authorized to modify this irrigation record');
    }

    irrigation = await Irrigation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: irrigation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete irrigation record
// @route   DELETE /api/irrigation/:id
// @access  Private (Farmer)
exports.deleteIrrigation = async (req, res, next) => {
  try {
    const irrigation = await Irrigation.findById(req.params.id);

    if (!irrigation) {
      res.statusCode = 404;
      throw new Error('Irrigation log not found');
    }

    const isOwner = await checkFarmOwner(irrigation.farmId, req.user._id);
    if (!isOwner) {
      res.statusCode = 403;
      throw new Error('Not authorized to delete this irrigation record');
    }

    await irrigation.deleteOne();

    res.json({
      success: true,
      message: 'Irrigation record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
