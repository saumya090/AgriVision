const Crop = require('../models/Crop');
const Farm = require('../models/Farm');

// Helper to check farm ownership
const checkFarmOwner = async (farmId, userId) => {
  const farm = await Farm.findById(farmId);
  return farm && farm.userId.toString() === userId.toString();
};

// @desc    Get all crops for user's farms
// @route   GET /api/crops
// @access  Private
exports.getCrops = async (req, res, next) => {
  try {
    let farmIds = [];

    if (req.user.role === 'Farmer') {
      const farms = await Farm.find({ userId: req.user._id });
      farmIds = farms.map(f => f._id);
    } else {
      const farms = await Farm.find({});
      farmIds = farms.map(f => f._id);
    }

    const crops = await Crop.find({ farmId: { $in: farmIds } }).populate('farmId', 'farmName');

    res.json({
      success: true,
      count: crops.length,
      data: crops
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get crops by farm id
// @route   GET /api/crops/farm/:farmId
// @access  Private
exports.getCropsByFarm = async (req, res, next) => {
  try {
    const isOwner = await checkFarmOwner(req.params.farmId, req.user._id);
    if (req.user.role !== 'Admin' && !isOwner) {
      res.statusCode = 403;
      throw new Error('Not authorized to access crops of this farm');
    }

    const crops = await Crop.find({ farmId: req.params.farmId });

    res.json({
      success: true,
      count: crops.length,
      data: crops
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a crop
// @route   POST /api/crops
// @access  Private (Farmer)
exports.createCrop = async (req, res, next) => {
  try {
    const { farmId, cropName, sowingDate, harvestDate, status } = req.body;

    const isOwner = await checkFarmOwner(farmId, req.user._id);
    if (!isOwner) {
      res.statusCode = 403;
      throw new Error('Not authorized to add crop to this farm');
    }

    // Check if there is already an Active crop on this farm
    if (status === 'Active') {
      const activeCrop = await Crop.findOne({ farmId, status: 'Active' });
      if (activeCrop) {
        res.statusCode = 400;
        throw new Error('Farm already has an active crop. Harvest or archive it first.');
      }
    }

    const crop = await Crop.create({
      farmId,
      cropName,
      sowingDate,
      harvestDate,
      status: status || 'Active'
    });

    res.status(201).json({
      success: true,
      data: crop
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update crop status or details
// @route   PUT /api/crops/:id
// @access  Private (Farmer)
exports.updateCrop = async (req, res, next) => {
  try {
    let crop = await Crop.findById(req.params.id);

    if (!crop) {
      res.statusCode = 404;
      throw new Error('Crop not found');
    }

    const isOwner = await checkFarmOwner(crop.farmId, req.user._id);
    if (!isOwner) {
      res.statusCode = 403;
      throw new Error('Not authorized to update this crop');
    }

    // If changing status to Active, check if another crop is already active
    if (req.body.status === 'Active' && crop.status !== 'Active') {
      const activeCrop = await Crop.findOne({ farmId: crop.farmId, status: 'Active' });
      if (activeCrop) {
        res.statusCode = 400;
        throw new Error('Farm already has an active crop.');
      }
    }

    crop = await Crop.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: crop
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete crop record
// @route   DELETE /api/crops/:id
// @access  Private (Farmer)
exports.deleteCrop = async (req, res, next) => {
  try {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      res.statusCode = 404;
      throw new Error('Crop not found');
    }

    const isOwner = await checkFarmOwner(crop.farmId, req.user._id);
    if (!isOwner) {
      res.statusCode = 403;
      throw new Error('Not authorized to delete this crop');
    }

    await crop.deleteOne();

    res.json({
      success: true,
      message: 'Crop record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
