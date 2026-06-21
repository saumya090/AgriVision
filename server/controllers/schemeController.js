const Scheme = require('../models/Scheme');

// @desc    Get all government schemes (with search and state filter)
// @route   GET /api/schemes
// @access  Private
exports.getSchemes = async (req, res, next) => {
  try {
    const { state, search } = req.query;
    let query = {};

    // Filter by state (if provided, match that state OR national "All" schemes)
    if (state && state !== 'All') {
      query.state = { $in: [state, 'All'] };
    }

    // Search query on title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { eligibility: { $regex: search, $options: 'i' } }
      ];
    }

    const schemes = await Scheme.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: schemes.length,
      data: schemes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single scheme details
// @route   GET /api/schemes/:id
// @access  Private
exports.getScheme = async (req, res, next) => {
  try {
    const scheme = await Scheme.findById(req.params.id);

    if (!scheme) {
      res.statusCode = 404;
      throw new Error('Scheme not found');
    }

    res.json({
      success: true,
      data: scheme
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a government scheme
// @route   POST /api/schemes
// @access  Private (Admin)
exports.createScheme = async (req, res, next) => {
  try {
    const { title, description, eligibility, state } = req.body;

    const scheme = await Scheme.create({
      title,
      description,
      eligibility,
      state: state || 'All'
    });

    res.status(201).json({
      success: true,
      data: scheme
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update government scheme
// @route   PUT /api/schemes/:id
// @access  Private (Admin)
exports.updateScheme = async (req, res, next) => {
  try {
    let scheme = await Scheme.findById(req.params.id);

    if (!scheme) {
      res.statusCode = 404;
      throw new Error('Scheme not found');
    }

    scheme = await Scheme.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: scheme
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete government scheme
// @route   DELETE /api/schemes/:id
// @access  Private (Admin)
exports.deleteScheme = async (req, res, next) => {
  try {
    const scheme = await Scheme.findById(req.params.id);

    if (!scheme) {
      res.statusCode = 404;
      throw new Error('Scheme not found');
    }

    await scheme.deleteOne();

    res.json({
      success: true,
      message: 'Scheme deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
