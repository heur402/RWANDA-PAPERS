const Category = require('../models/Category.model');
const Document = require('../models/Document.model');

// @desc    Get all categories with document counts
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    // Attach document count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Document.countDocuments({ category: cat._id, status: 'approved' });
        return { ...cat.toObject(), documentCount: count };
      })
    );

    res.json({ success: true, data: categoriesWithCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private (admin)
const createCategory = async (req, res, next) => {
  try {
    const { name, description, icon } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const category = await Category.create({ name, description, icon });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (admin)
const updateCategory = async (req, res, next) => {
  try {
    const { name, description, icon } = req.body;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, icon },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (admin)
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
