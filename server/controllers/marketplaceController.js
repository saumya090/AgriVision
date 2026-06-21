const Product = require('../models/Product');

// @desc    Get all marketplace listings
// @route   GET /api/marketplace
// @access  Private
exports.getProducts = async (req, res, next) => {
  try {
    const { search, location } = req.query;
    let query = {};

    if (search) {
      query.cropName = { $regex: search, $options: 'i' };
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const products = await Product.find(query)
      .populate('farmerId', 'name email phone state')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get listings created by the logged-in farmer
// @route   GET /api/marketplace/my-listings
// @access  Private
exports.getMyListings = async (req, res, next) => {
  try {
    const products = await Product.find({ farmerId: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product listing
// @route   POST /api/marketplace
// @access  Private (Farmer)
exports.createProduct = async (req, res, next) => {
  try {
    const { cropName, quantity, price, location, description, contactPhone } = req.body;

    const product = await Product.create({
      farmerId: req.user._id,
      cropName,
      quantity,
      price,
      location,
      description,
      contactPhone: contactPhone || req.user.phone
    });

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a listing
// @route   PUT /api/marketplace/:id
// @access  Private (Farmer)
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      res.statusCode = 404;
      throw new Error('Product listing not found');
    }

    // Check ownership
    if (product.farmerId.toString() !== req.user._id.toString()) {
      res.statusCode = 403;
      throw new Error('Not authorized to update this listing');
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a listing
// @route   DELETE /api/marketplace/:id
// @access  Private (Farmer/Admin)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.statusCode = 404;
      throw new Error('Product listing not found');
    }

    // Check ownership or admin role
    if (req.user.role !== 'Admin' && product.farmerId.toString() !== req.user._id.toString()) {
      res.statusCode = 403;
      throw new Error('Not authorized to delete this listing');
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: 'Product listing deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
