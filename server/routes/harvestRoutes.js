const express = require('express');
const router = express.Router();
const {
  getHarvests,
  createHarvest,
  deleteHarvest
} = require('../controllers/harvestController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getHarvests)
  .post(protect, authorize('Farmer'), createHarvest);

router.route('/:id')
  .delete(protect, authorize('Farmer'), deleteHarvest);

module.exports = router;
