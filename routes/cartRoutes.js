const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { addToCart, updateCartItem, removeCartItem } = require('../controllers/cartController');

router.use(protect); // Protect all cart routes
router.post('/', addToCart);
router.put('/:id', updateCartItem);
router.delete('/:id', removeCartItem);

module.exports = router;