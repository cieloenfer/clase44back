const Product = require('../models/product.model');
const logger = require('../utils/logger');

// Crear producto
exports.createProduct = async (req, res) => {
  try {
    const { name, price, stock } = req.body;
    const owner = req.user.role === 'premium' ? req.user._id : 'admin';
    const newProduct = new Product({ name, price, stock, owner });
    await newProduct.save();
    res.status(201).json(newProduct);
    logger.info(`Product created by ${req.user.email}`);
  } catch (error) {
    logger.error('Error creating product:', error);
    res.status(500).json({ message: error.message });
  }
};

// Eliminar producto
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (req.user.role !== 'admin' && product.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You do not have permission to delete this product' });
    }

    await product.remove();
    res.status(200).json({ message: 'Product deleted' });
    logger.info(`Product deleted by ${req.user.email}`);
  } catch (error) {
    logger.error('Error deleting product:', error);
    res.status(500).json({ message: error.message });
  }
};
