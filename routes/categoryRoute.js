// routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const Category = require('../model/category');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().populate('children');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new category
router.post('/', async (req, res) => {
  try {
    const { name, parentId } = req.body;
    const category = new Category({ name, parentId });

    if (parentId) {
      const parentCategory = await Category.findById(parentId);
      parentCategory.children.push(category._id);
      await parentCategory.save();
    }

    const newCategory = await category.save();
    res.json(newCategory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a category
router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    const updatedCategory = await Category.findByIdAndUpdate(req.params.id, { name }, { new: true });
    res.json(updatedCategory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a category
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category.parentId) {
      const parentCategory = await Category.findById(category.parentId);
      parentCategory.children.pull(category._id);
      await parentCategory.save();
    }

    await category.deleteOne();
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
