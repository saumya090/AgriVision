const Farm = require('../models/Farm');
const Crop = require('../models/Crop');
const Irrigation = require('../models/Irrigation');
const Expense = require('../models/Expense');
const Harvest = require('../models/Harvest');

// @desc    Get all farms for logged-in user
// @route   GET /api/farms
// @access  Private
exports.getFarms = async (req, res, next) => {
  try {
    let query = {};
    
    // Farmers can only see their own farms, Admins can see all
    if (req.user.role === 'Farmer') {
      query = { userId: req.user._id };
    }

    const farms = await Farm.find(query);

    // Let's attach active crops to each farm object dynamically for convenience
    const farmsWithCrops = await Promise.all(
      farms.map(async (farm) => {
        const activeCrop = await Crop.findOne({ farmId: farm._id, status: 'Active' });
        return {
          ...farm.toObject(),
          activeCrop: activeCrop ? activeCrop.cropName : 'None'
        };
      })
    );

    res.json({
      success: true,
      count: farmsWithCrops.length,
      data: farmsWithCrops
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single farm
// @route   GET /api/farms/:id
// @access  Private
exports.getFarm = async (req, res, next) => {
  try {
    const farm = await Farm.findById(req.params.id);

    if (!farm) {
      res.statusCode = 404;
      throw new Error('Farm not found');
    }

    // Check ownership
    if (req.user.role === 'Farmer' && farm.userId.toString() !== req.user._id.toString()) {
      res.statusCode = 403;
      throw new Error('Not authorized to access this farm');
    }

    const activeCrop = await Crop.findOne({ farmId: farm._id, status: 'Active' });

    res.json({
      success: true,
      data: {
        ...farm.toObject(),
        activeCrop: activeCrop ? activeCrop.cropName : 'None'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new farm
// @route   POST /api/farms
// @access  Private (Farmer)
exports.createFarm = async (req, res, next) => {
  try {
    const { farmName, area, soilType, location } = req.body;

    const farm = await Farm.create({
      userId: req.user._id,
      farmName,
      area,
      soilType,
      location
    });

    res.status(201).json({
      success: true,
      data: farm
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a farm
// @route   PUT /api/farms/:id
// @access  Private (Farmer)
exports.updateFarm = async (req, res, next) => {
  try {
    let farm = await Farm.findById(req.params.id);

    if (!farm) {
      res.statusCode = 404;
      throw new Error('Farm not found');
    }

    // Check ownership
    if (farm.userId.toString() !== req.user._id.toString()) {
      res.statusCode = 403;
      throw new Error('Not authorized to modify this farm');
    }

    farm = await Farm.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: farm
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a farm
// @route   DELETE /api/farms/:id
// @access  Private (Farmer/Admin)
exports.deleteFarm = async (req, res, next) => {
  try {
    const farm = await Farm.findById(req.params.id);

    if (!farm) {
      res.statusCode = 404;
      throw new Error('Farm not found');
    }

    // Check ownership (only owners or admin can delete)
    if (req.user.role !== 'Admin' && farm.userId.toString() !== req.user._id.toString()) {
      res.statusCode = 403;
      throw new Error('Not authorized to delete this farm');
    }

    // Remove all associated documents to keep database clean
    await Crop.deleteMany({ farmId: farm._id });
    await Irrigation.deleteMany({ farmId: farm._id });
    await Expense.deleteMany({ farmId: farm._id });
    await Harvest.deleteMany({ farmId: farm._id });
    
    await farm.deleteOne();

    res.json({
      success: true,
      message: 'Farm and all associated data deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
