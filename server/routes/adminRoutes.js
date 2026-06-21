const express = require('express');
const router = express.Router();
const {
  getPlatformStats,
  getUsers,
  deleteUser
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Lock down all routes to Admins only
router.use(protect);
router.use(authorize('Admin'));

router.get('/stats', getPlatformStats);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);

module.exports = router;
