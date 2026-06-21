const Harvest = require('../models/Harvest');
const Farm = require('../models/Farm');
const Crop = require('../models/Crop');

const checkFarmOwner = async (farmId, userId) => {
  const farm = await Farm.findById(farmId);
  return farm && farm.userId.toString() === userId.toString();
};

// @desc    Get all harvest records
// @route   GET /api/harvests
// @access  Private
exports.getHarvests = async (req, res, next) => {
  try {
    let farmIds = [];

    if (req.user.role === 'Farmer') {
      const farms = await Farm.find({ userId: req.user._id });
      farmIds = farms.map(f => f._id);
    } else {
      const farms = await Farm.find({});
      farmIds = farms.map(f => f._id);
    }

    const harvests = await Harvest.find({ farmId: { $in: farmIds } })
      .populate('farmId', 'farmName')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: harvests.length,
      data: harvests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record a new harvest
// @route   POST /api/harvests
// @access  Private (Farmer)
exports.createHarvest = async (req, res, next) => {
  try {
    const { farmId, cropName, quantity, sellingPrice, date, markAsHarvested } = req.body;

    const isOwner = await checkFarmOwner(farmId, req.user._id);
    if (!isOwner) {
      res.statusCode = 403;
      throw new Error('Not authorized to add harvest to this farm');
    }

    const harvest = await Harvest.create({
      farmId,
      cropName,
      quantity,
      sellingPrice,
      date: date || new Date()
    });

    // If user requested to mark the active crop as harvested
    if (markAsHarvested) {
      await Crop.findOneAndUpdate(
        { farmId, cropName, status: 'Active' },
        { status: 'Harvested', harvestDate: date || new Date() }
      );
    }

    res.status(201).json({
      success: true,
      data: harvest
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete harvest record
// @route   DELETE /api/harvests/:id
// @access  Private (Farmer)
exports.deleteHarvest = async (req, res, next) => {
  try {
    const harvest = await Harvest.findById(req.params.id);

    if (!harvest) {
      res.statusCode = 404;
      throw new Error('Harvest record not found');
    }

    const isOwner = await checkFarmOwner(harvest.farmId, req.user._id);
    if (!isOwner) {
      res.statusCode = 403;
      throw new Error('Not authorized to delete this harvest record');
    }

    await harvest.deleteOne();

    res.json({
      success: true,
      message: 'Harvest record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
