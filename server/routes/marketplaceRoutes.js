const express = require('express');
const router = express.Router();
const {
  getProducts,
  getMyListings,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/marketplaceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getProducts)
  .post(protect, authorize('Farmer'), createProduct);

router.get('/my-listings', protect, authorize('Farmer'), getMyListings);

router.route('/:id')
  .put(protect, authorize('Farmer'), updateProduct)
  .delete(protect, deleteProduct);

module.exports = router;
