const { prisma } = require('../../database/supabase/client');

// Helper to check if requester is admin
const verifyAdmin = async (req) => {
  const requesterId = req.headers['x-requester-id'];
  if (!requesterId) return false;
  const requester = await prisma.user.findUnique({ where: { id: requesterId } });
  return requester && requester.role === 'admin';
};

const mapCategory = (cat) => {
  if (!cat) return null;
  const mapped = {
    ...cat,
    _id: cat.id,
    parentCategory: cat.parentCategory ? { ...cat.parentCategory, _id: cat.parentCategory.id } : cat.parentCategory
  };
  delete mapped.id;
  if (mapped.parentCategory) delete mapped.parentCategory.id;
  return mapped;
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const where = {};
    if (req.query.status) {
      where.status = req.query.status;
    } else {
      where.status = { not: 'Archived' };
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        parentCategory: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: [
        { displayOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    res.status(200).json(categories.map(mapCategory));
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
    const slugExists = await prisma.category.findUnique({ where: { slug: slug.toLowerCase() } });
    if (slugExists) {
      return res.status(400).json({ message: 'Category slug already exists' });
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug: slug.toLowerCase(),
        description: description || '',
        image: image || '',
        parentCategoryId: parentCategory || null,
        displayOrder: displayOrder || 0,
        featured: !!featured,
        showOnHomepage: !!showOnHomepage,
        status: status || 'Active'
      }
    });

    res.status(201).json(mapCategory(category));
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

    const category = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const { name, slug, description, image, parentCategory, displayOrder, featured, showOnHomepage, status } = req.body;

    const data = {};
    if (slug && slug.toLowerCase() !== category.slug) {
      const slugExists = await prisma.category.findUnique({ where: { slug: slug.toLowerCase() } });
      if (slugExists) {
        return res.status(400).json({ message: 'Category slug already exists' });
      }
      data.slug = slug.toLowerCase();
    }

    if (name) data.name = name;
    if (description !== undefined) data.description = description;
    if (image !== undefined) data.image = image;
    data.parentCategoryId = parentCategory || null;
    if (displayOrder !== undefined) data.displayOrder = displayOrder;
    if (featured !== undefined) data.featured = !!featured;
    if (showOnHomepage !== undefined) data.showOnHomepage = !!showOnHomepage;
    if (status) data.status = status;

    const updated = await prisma.category.update({
      where: { id: req.params.id },
      data
    });

    res.status(200).json(mapCategory(updated));
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

    const category = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await prisma.category.delete({ where: { id: req.params.id } });
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
      await prisma.category.deleteMany({
        where: {
          id: { in: ids }
        }
      });
      return res.status(200).json({ message: 'Bulk delete operation successful' });
    }

    if (action === 'status') {
      if (!['Active', 'Inactive', 'Archived'].includes(value)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }
      await prisma.category.updateMany({
        where: {
          id: { in: ids }
        },
        data: {
          status: value
        }
      });
      return res.status(200).json({ message: `Bulk status update to ${value} successful` });
    }

    res.status(400).json({ message: 'Invalid bulk action operation' });
  } catch (error) {
    res.status(500).json({ message: 'Error executing bulk action', error: error.message });
  }
};
