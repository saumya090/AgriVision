const express = require('express');
const router = express.Router();
const {
  getFarms,
  getFarm,
  createFarm,
  updateFarm,
  deleteFarm
} = require('../controllers/farmController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getFarms)
  .post(protect, authorize('Farmer'), createFarm);

router.route('/:id')
  .get(protect, getFarm)
  .put(protect, authorize('Farmer'), updateFarm)
  .delete(protect, deleteFarm);

module.exports = router;
