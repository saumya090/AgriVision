const express = require('express');
const router = express.Router();
const {
  getCrops,
  getCropsByFarm,
  createCrop,
  updateCrop,
  deleteCrop
} = require('../controllers/cropController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getCrops)
  .post(protect, authorize('Farmer'), createCrop);

router.get('/farm/:farmId', protect, getCropsByFarm);

router.route('/:id')
  .put(protect, authorize('Farmer'), updateCrop)
  .delete(protect, authorize('Farmer'), deleteCrop);

module.exports = router;
