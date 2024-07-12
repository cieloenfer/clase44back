const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const logger = require('../utils/logger');

// Agregar producto al carrito
exports.addProductToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (req.user.role === 'premium' && product.owner.toString() === req.user._id.toString()) {
      return res.status(403).json({ message: 'You cannot add your own product to the cart' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    cart.products.push(productId);
    await cart.save();

    res.status(200).json(cart);
    logger.info(`Product added to cart by ${req.user.email}`);
  } catch (error) {
    logger.error('Error adding product to cart:', error);
    res.status(500).json({ message: error.message });
  }
};
