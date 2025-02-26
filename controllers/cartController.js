const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.userId;

    // Validate inputs
    if (!productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Product ID and quantity are required"
      });
    }

    // Check product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Check stock availability
    if (product.stockQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stockQuantity} items available in stock`
      });
    }

    // Create cart item
    const cartItem = await Cart.create({
      userId: userId,
      productId: productId,
      quantity: quantity
    });

    res.status(201).json({
      success: true,
      data: cartItem
    });

  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while adding to cart",
      error: err.message
    });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { id } = req.params;
    const userId = req.user.userId;

    // Validate input
    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Valid quantity (minimum 1) is required"
      });
    }

    // Find cart item
    const cartItem = await Cart.findById(id);
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found"
      });
    }

    // Verify ownership
    if (cartItem.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this cart item"
      });
    }

    // Get product stock
    const product = await Product.findById(cartItem.productId);
    if (quantity > product.stockQuantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stockQuantity} items available in stock`
      });
    }

    // Update quantity
    const updatedItem = await Cart.findByIdAndUpdate(
      id,
      { quantity },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedItem
    });

  } catch (err) {
    console.error("Update cart error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while updating cart",
      error: err.message
    });
  }
};

exports.removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const cartItem = await Cart.findById(id);
    
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found"
      });
    }

    // Verify ownership
    if (cartItem.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to remove this cart item"
      });
    }

    await Cart.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Cart item removed successfully"
    });

  } catch (err) {
    console.error("Remove cart error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while removing cart item",
      error: err.message
    });
  }
};