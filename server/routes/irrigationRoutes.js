const express = require('express');
const router = express.Router();
const {
  getIrrigations,
  getIrrigationByFarm,
  createIrrigation,
  updateIrrigation,
  deleteIrrigation
} = require('../controllers/irrigationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getIrrigations)
  .post(protect, authorize('Farmer'), createIrrigation);

router.get('/farm/:farmId', protect, getIrrigationByFarm);

router.route('/:id')
  .put(protect, authorize('Farmer'), updateIrrigation)
  .delete(protect, authorize('Farmer'), deleteIrrigation);

module.exports = router;
