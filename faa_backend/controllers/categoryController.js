const Category = require('../models/Category');
const cloudinary = require('cloudinary').v2;

// Helper to generate a URL-friendly slug
const generateSlug = (name) => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single category by ID
// @route   GET /api/categories/:id
// @access  Public
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private (Admin & Support)
exports.createCategory = async (req, res) => {
  try {
    const { name, description, image, imageId, icon, iconId } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const slug = generateSlug(name);

    // Check if category already exists
    const categoryExists = await Category.findOne({ slug });
    if (categoryExists) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }

    const category = await Category.create({
      name,
      slug,
      description,
      image,
      imageId,
      icon,
      iconId
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private (Admin & Support)
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, image, imageId, icon, iconId } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (name) {
      category.name = name;
      category.slug = generateSlug(name);
    }
    if (description !== undefined) category.description = description;
    if (image !== undefined) {
      if (category.imageId && category.imageId !== imageId) {
        // Delete old image from cloudinary
        try {
          await cloudinary.uploader.destroy(category.imageId);
        } catch (err) {
          console.error('Failed to delete old image from cloudinary', err);
        }
      }
      category.image = image;
      category.imageId = imageId;
    }
    
    if (icon !== undefined) {
      if (category.iconId && category.iconId !== iconId) {
        // Delete old icon from cloudinary
        try {
          await cloudinary.uploader.destroy(category.iconId);
        } catch (err) {
          console.error('Failed to delete old icon from cloudinary', err);
        }
      }
      category.icon = icon;
      category.iconId = iconId;
    }

    const updatedCategory = await category.save();

    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private (Admin & Support)
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Delete image from cloudinary if it exists
    if (category.imageId) {
      try {
        await cloudinary.uploader.destroy(category.imageId);
      } catch (err) {
        console.error('Failed to delete image from cloudinary', err);
      }
    }
    
    // Delete icon from cloudinary if it exists
    if (category.iconId) {
      try {
        await cloudinary.uploader.destroy(category.iconId);
      } catch (err) {
        console.error('Failed to delete icon from cloudinary', err);
      }
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Category removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
