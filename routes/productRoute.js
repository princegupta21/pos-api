// routes/product.js
const express = require('express');
const router = express.Router();
const Product = require('../model/product');

// Get all products
router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 5, search = '' } = req.query;
    const query = search ? { name: new RegExp(search, 'i') } : {};

    const products = await Product.find(query).populate('category')
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize));

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / pageSize);

    res.json({ products, totalPages });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching products' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.json(product)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Add a new product
router.post('/', async (req, res) => {
  try {
    const { name, description, price, quantity, category, imageUrl, imageHash, sku } = req.body;
    const newProduct = new Product({ name, description, price, quantity, imageUrl, imageHash, sku, category });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a product
router.put('/:id', async (req, res) => {
  try {
    const { name, description, price, quantity, category, imageUrl, imageHash, sku } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price, quantity, imageUrl, imageHash, sku, category },
      { new: true }
    );
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a product
router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
