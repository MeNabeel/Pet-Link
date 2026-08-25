const Category = require('../../models/Category');
const User = require('../../models/User');

// Helper to check if requester is admin
const verifyAdmin = async (req) => {
  const requesterId = req.headers['x-requester-id'];
  if (!requesterId) return false;
  const requester = await User.findById(requesterId);
  return requester && requester.role === 'admin';
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const filter = {};
    
    // Status filter
    if (req.query.status) {
      filter.status = req.query.status;
    } else {
      // By default, do not show Archived in general lists unless requested
      filter.status = { $ne: 'Archived' };
    }

    const categories = await Category.find(filter)
      .populate('parentCategory', 'name slug')
      .sort({ displayOrder: 1, name: 1 });

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving categories', error: error.message });
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (Admin)
exports.createCategory = async (req, res) => {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Admin access only' });
    }

    const { name, slug, description, image, parentCategory, displayOrder, featured, showOnHomepage, status } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ message: 'Name and slug are required' });
    }

    // Check slug duplicate
    const slugExists = await Category.findOne({ slug: slug.toLowerCase() });
    if (slugExists) {
      return res.status(400).json({ message: 'Category slug already exists' });
    }

    const category = await Category.create({
      name,
      slug: slug.toLowerCase(),
      description,
      image,
      parentCategory: parentCategory || null,
      displayOrder: displayOrder || 0,
      featured: !!featured,
      showOnHomepage: !!showOnHomepage,
      status: status || 'Active'
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
};

// @desc    Update existing category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
exports.updateCategory = async (req, res) => {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Admin access only' });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const { name, slug, description, image, parentCategory, displayOrder, featured, showOnHomepage, status } = req.body;

    if (slug && slug.toLowerCase() !== category.slug) {
      const slugExists = await Category.findOne({ slug: slug.toLowerCase() });
      if (slugExists) {
        return res.status(400).json({ message: 'Category slug already exists' });
      }
      category.slug = slug.toLowerCase();
    }

    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    category.parentCategory = parentCategory || null;
    if (displayOrder !== undefined) category.displayOrder = displayOrder;
    if (featured !== undefined) category.featured = !!featured;
    if (showOnHomepage !== undefined) category.showOnHomepage = !!showOnHomepage;
    if (status) category.status = status;

    await category.save();
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
};

// @desc    Delete single category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
exports.deleteCategory = async (req, res) => {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Admin access only' });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
};

// @desc    Perform bulk actions on categories
// @route   POST /api/categories/bulk
// @access  Private (Admin)
exports.bulkCategoryAction = async (req, res) => {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Admin access only' });
    }

    const { ids, action, value } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No category IDs selected' });
    }

    if (action === 'delete') {
      await Category.deleteMany({ _id: { $in: ids } });
      return res.status(200).json({ message: 'Bulk delete operation successful' });
    }

    if (action === 'status') {
      if (!['Active', 'Inactive', 'Archived'].includes(value)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }
      await Category.updateMany({ _id: { $in: ids } }, { $set: { status: value } });
      return res.status(200).json({ message: `Bulk status update to ${value} successful` });
    }

    res.status(400).json({ message: 'Invalid bulk action operation' });
  } catch (error) {
    res.status(500).json({ message: 'Error executing bulk action', error: error.message });
  }
};
