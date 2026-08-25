const { prisma } = require('../../database/supabase/client');

// Helper to check if requester is admin
const verifyAdmin = async (req) => {
  const requesterId = req.headers['x-requester-id'];
  if (!requesterId) return false;
  const requester = await prisma.user.findUnique({ where: { id: requesterId } });
  return requester && requester.role === 'admin';
};

const mapProduct = (prod) => {
  if (!prod) return null;
  const mapped = {
    ...prod,
    _id: prod.id,
    category: prod.category ? { ...prod.category, _id: prod.category.id } : prod.categoryId
  };
  delete mapped.id;
  delete mapped.categoryId;
  if (mapped.category && typeof mapped.category === 'object') {
    delete mapped.category.id;
  }
  return mapped;
};

// @desc    Get all products (with optional filtering)
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const where = {};

    // Search query filter (matches name, brand, sku)
    if (req.query.search) {
      const searchStr = req.query.search;
      where.OR = [
        { name: { contains: searchStr, mode: 'insensitive' } },
        { brand: { contains: searchStr, mode: 'insensitive' } },
        { sku: { contains: searchStr, mode: 'insensitive' } }
      ];
    }

    // Category filter
    if (req.query.category) {
      where.categoryId = req.query.category;
    }

    // Pet Type filter
    if (req.query.petType) {
      where.petType = req.query.petType;
    }

    // Visibility filter (for users we only show Public)
    if (req.query.visibility) {
      where.visibility = req.query.visibility;
    }

    // Status filter (for users we only show Published)
    if (req.query.status) {
      where.status = req.query.status;
    } else {
      // By default, exclude Archived items
      where.status = { not: 'Archived' };
    }

    // Featured filter
    if (req.query.featured) {
      where.featured = req.query.featured === 'true';
    }

    // Recommended filter
    if (req.query.recommended) {
      where.recommended = req.query.recommended === 'true';
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(products.map(mapProduct));
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving products', error: error.message });
  }
};

// @desc    Create new product listing
// @route   POST /api/products
// @access  Private (Admin)
exports.createProduct = async (req, res) => {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Admin access only' });
    }

    const { 
      name, category, images, brand, sku, barcode, description, shortDescription,
      regularPrice, salePrice, discount, stockQuantity, stockStatus, weight,
      dimensions, petType, ageGroup, tags, visibility, featured, recommended, status,
      productType, clothingSpecs, toySpecs, foodSpecs, supplementSpecs, medicineSpecs, groomingSpecs,
      costPrice, compareAtPrice, profitMargin, tax, shippingCost, saleStartDate, saleEndDate,
      trackInventory, lowStockAlert, warehouse, supplier, allowBackorder, reservedStock, restockDate,
      length, width, height, shippingClass, fragile, freeShipping, cashOnDelivery,
      seoTitle, metaDescription, seoKeywords, ogImage,
      gtin, vendor, countryOfOrigin, warranty, internalNotes, searchKeywords,
      breedCompat, ageCompat, weightCompat, genderCompat,
      variants, frequentlyBoughtTogether, relatedProducts, crossSell, upsell,
      enableReviews, enableRatings, verifiedPurchaseOnly
    } = req.body;

    if (!name || !category || !sku || regularPrice === undefined) {
      return res.status(400).json({ message: 'Name, Category, SKU, and Regular Price are required' });
    }

    // Check SKU duplicates
    const skuExists = await prisma.product.findUnique({ where: { sku: sku.trim() } });
    if (skuExists) {
      return res.status(400).json({ message: 'SKU code already exists in catalog' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        categoryId: category,
        images: images || [],
        brand: brand || '',
        sku: sku.trim(),
        barcode: barcode || '',
        description: description || '',
        shortDescription: shortDescription || '',
        regularPrice: parseFloat(regularPrice),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        discount: discount ? parseFloat(discount) : 0,
        stockQuantity: stockQuantity !== undefined ? parseInt(stockQuantity, 10) : 0,
        stockStatus: stockStatus || 'In Stock',
        weight: weight || '',
        dimensions: dimensions || '',
        petType: petType || '',
        ageGroup: ageGroup || '',
        tags: tags || [],
        visibility: visibility || 'Public',
        featured: !!featured,
        recommended: !!recommended,
        status: status || 'Published',
        productType: productType || 'Other',
        clothingSpecs: clothingSpecs || {},
        toySpecs: toySpecs || {},
        foodSpecs: foodSpecs || {},
        supplementSpecs: supplementSpecs || {},
        medicineSpecs: medicineSpecs || {},
        groomingSpecs: groomingSpecs || {},
        costPrice: costPrice ? parseFloat(costPrice) : 0,
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : 0,
        profitMargin: profitMargin ? parseFloat(profitMargin) : 0,
        tax: tax ? parseFloat(tax) : 0,
        shippingCost: shippingCost ? parseFloat(shippingCost) : 0,
        saleStartDate: saleStartDate || null,
        saleEndDate: saleEndDate || null,
        trackInventory: trackInventory !== undefined ? !!trackInventory : true,
        lowStockAlert: lowStockAlert !== undefined ? parseInt(lowStockAlert, 10) : 5,
        warehouse: warehouse || '',
        supplier: supplier || '',
        allowBackorder: !!allowBackorder,
        reservedStock: reservedStock ? parseInt(reservedStock, 10) : 0,
        restockDate: restockDate || null,
        length: length ? parseFloat(length) : 0,
        width: width ? parseFloat(width) : 0,
        height: height ? parseFloat(height) : 0,
        shippingClass: shippingClass || '',
        fragile: !!fragile,
        freeShipping: !!freeShipping,
        cashOnDelivery: cashOnDelivery !== undefined ? !!cashOnDelivery : true,
        seoTitle: seoTitle || '',
        metaDescription: metaDescription || '',
        seoKeywords: seoKeywords || [],
        ogImage: ogImage || '',
        gtin: gtin || '',
        vendor: vendor || '',
        countryOfOrigin: countryOfOrigin || 'Pakistan',
        warranty: warranty || '',
        internalNotes: internalNotes || '',
        searchKeywords: searchKeywords || [],
        breedCompat: breedCompat || [],
        ageCompat: ageCompat || [],
        weightCompat: weightCompat || '',
        genderCompat: genderCompat || '',
        variants: variants || [],
        frequentlyBoughtTogether: frequentlyBoughtTogether || [],
        relatedProducts: relatedProducts || [],
        crossSell: crossSell || [],
        upsell: upsell || [],
        enableReviews: enableReviews !== undefined ? !!enableReviews : true,
        enableRatings: enableRatings !== undefined ? !!enableRatings : true,
        verifiedPurchaseOnly: verifiedPurchaseOnly !== undefined ? !!verifiedPurchaseOnly : true
      }
    });

    res.status(201).json(mapProduct(product));
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
};

// @desc    Update existing product listing
// @route   PUT /api/products/:id
// @access  Private (Admin)
exports.updateProduct = async (req, res) => {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Admin access only' });
    }

    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { 
      name, category, images, brand, sku, barcode, description, shortDescription,
      regularPrice, salePrice, discount, stockQuantity, stockStatus, weight,
      dimensions, petType, ageGroup, tags, visibility, featured, recommended, status,
      productType, clothingSpecs, toySpecs, foodSpecs, supplementSpecs, medicineSpecs, groomingSpecs,
      costPrice, compareAtPrice, profitMargin, tax, shippingCost, saleStartDate, saleEndDate,
      trackInventory, lowStockAlert, warehouse, supplier, allowBackorder, reservedStock, restockDate,
      length, width, height, shippingClass, fragile, freeShipping, cashOnDelivery,
      seoTitle, metaDescription, seoKeywords, ogImage,
      gtin, vendor, countryOfOrigin, warranty, internalNotes, searchKeywords,
      breedCompat, ageCompat, weightCompat, genderCompat,
      variants, frequentlyBoughtTogether, relatedProducts, crossSell, upsell,
      enableReviews, enableRatings, verifiedPurchaseOnly
    } = req.body;

    const data = {};

    if (sku && sku.trim() !== product.sku) {
      const skuExists = await prisma.product.findUnique({ where: { sku: sku.trim() } });
      if (skuExists) {
        return res.status(400).json({ message: 'SKU code already exists in catalog' });
      }
      data.sku = sku.trim();
    }

    if (name) data.name = name;
    if (category) data.categoryId = category;
    if (images !== undefined) data.images = images;
    if (brand !== undefined) data.brand = brand;
    if (barcode !== undefined) data.barcode = barcode;
    if (description !== undefined) data.description = description;
    if (shortDescription !== undefined) data.shortDescription = shortDescription;
    if (regularPrice !== undefined) data.regularPrice = parseFloat(regularPrice);
    if (salePrice !== undefined) data.salePrice = salePrice ? parseFloat(salePrice) : null;
    if (discount !== undefined) data.discount = parseFloat(discount);
    if (stockQuantity !== undefined) data.stockQuantity = parseInt(stockQuantity, 10);
    if (stockStatus) data.stockStatus = stockStatus;
    if (weight !== undefined) data.weight = weight;
    if (dimensions !== undefined) data.dimensions = dimensions;
    if (petType !== undefined) data.petType = petType;
    if (ageGroup !== undefined) data.ageGroup = ageGroup;
    if (tags !== undefined) data.tags = tags;
    if (visibility) data.visibility = visibility;
    if (featured !== undefined) data.featured = !!featured;
    if (recommended !== undefined) data.recommended = !!recommended;
    if (status) data.status = status;

    if (productType !== undefined) data.productType = productType;
    if (clothingSpecs !== undefined) data.clothingSpecs = clothingSpecs;
    if (toySpecs !== undefined) data.toySpecs = toySpecs;
    if (foodSpecs !== undefined) data.foodSpecs = foodSpecs;
    if (supplementSpecs !== undefined) data.supplementSpecs = supplementSpecs;
    if (medicineSpecs !== undefined) data.medicineSpecs = medicineSpecs;
    if (groomingSpecs !== undefined) data.groomingSpecs = groomingSpecs;

    if (costPrice !== undefined) data.costPrice = parseFloat(costPrice);
    if (compareAtPrice !== undefined) data.compareAtPrice = parseFloat(compareAtPrice);
    if (profitMargin !== undefined) data.profitMargin = parseFloat(profitMargin);
    if (tax !== undefined) data.tax = parseFloat(tax);
    if (shippingCost !== undefined) data.shippingCost = parseFloat(shippingCost);
    if (saleStartDate !== undefined) data.saleStartDate = saleStartDate;
    if (saleEndDate !== undefined) data.saleEndDate = saleEndDate;

    if (trackInventory !== undefined) data.trackInventory = !!trackInventory;
    if (lowStockAlert !== undefined) data.lowStockAlert = parseInt(lowStockAlert, 10);
    if (warehouse !== undefined) data.warehouse = warehouse;
    if (supplier !== undefined) data.supplier = supplier;
    if (allowBackorder !== undefined) data.allowBackorder = !!allowBackorder;
    if (reservedStock !== undefined) data.reservedStock = parseInt(reservedStock, 10);
    if (restockDate !== undefined) data.restockDate = restockDate;

    if (length !== undefined) data.length = parseFloat(length);
    if (width !== undefined) data.width = parseFloat(width);
    if (height !== undefined) data.height = parseFloat(height);
    if (shippingClass !== undefined) data.shippingClass = shippingClass;
    if (fragile !== undefined) data.fragile = !!fragile;
    if (freeShipping !== undefined) data.freeShipping = !!freeShipping;
    if (cashOnDelivery !== undefined) data.cashOnDelivery = !!cashOnDelivery;

    if (seoTitle !== undefined) data.seoTitle = seoTitle;
    if (metaDescription !== undefined) data.metaDescription = metaDescription;
    if (seoKeywords !== undefined) data.seoKeywords = seoKeywords;
    if (ogImage !== undefined) data.ogImage = ogImage;

    if (gtin !== undefined) data.gtin = gtin;
    if (vendor !== undefined) data.vendor = vendor;
    if (countryOfOrigin !== undefined) data.countryOfOrigin = countryOfOrigin;
    if (warranty !== undefined) data.warranty = warranty;
    if (internalNotes !== undefined) data.internalNotes = internalNotes;
    if (searchKeywords !== undefined) data.searchKeywords = searchKeywords;

    if (breedCompat !== undefined) data.breedCompat = breedCompat;
    if (ageCompat !== undefined) data.ageCompat = ageCompat;
    if (weightCompat !== undefined) data.weightCompat = weightCompat;
    if (genderCompat !== undefined) data.genderCompat = genderCompat;

    if (variants !== undefined) data.variants = variants;
    if (frequentlyBoughtTogether !== undefined) data.frequentlyBoughtTogether = frequentlyBoughtTogether;
    if (relatedProducts !== undefined) data.relatedProducts = relatedProducts;
    if (crossSell !== undefined) data.crossSell = crossSell;
    if (upsell !== undefined) data.upsell = upsell;

    if (enableReviews !== undefined) data.enableReviews = !!enableReviews;
    if (enableRatings !== undefined) data.enableRatings = !!enableRatings;
    if (verifiedPurchaseOnly !== undefined) data.verifiedPurchaseOnly = !!verifiedPurchaseOnly;

    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    res.status(200).json(mapProduct(updated));
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

// @desc    Duplicate existing product listing
// @route   POST /api/products/:id/duplicate
// @access  Private (Admin)
exports.duplicateProduct = async (req, res) => {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Admin access only' });
    }

    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) {
      return res.status(404).json({ message: 'Product to duplicate not found' });
    }

    const randStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newSku = `${product.sku}-DUP-${randStr}`;

    const newProduct = await prisma.product.create({
      data: {
        name: `${product.name} (Copy)`,
        categoryId: product.categoryId,
        images: product.images,
        brand: product.brand,
        sku: newSku,
        barcode: product.barcode,
        description: product.description,
        shortDescription: product.shortDescription,
        regularPrice: product.regularPrice,
        salePrice: product.salePrice,
        discount: product.discount,
        stockQuantity: product.stockQuantity,
        stockStatus: product.stockStatus,
        weight: product.weight,
        dimensions: product.dimensions,
        petType: product.petType,
        ageGroup: product.ageGroup,
        tags: product.tags,
        visibility: product.visibility,
        featured: product.featured,
        recommended: product.recommended,
        status: 'Draft',
        productType: product.productType || 'Other',
        clothingSpecs: product.clothingSpecs || {},
        toySpecs: product.toySpecs || {},
        foodSpecs: product.foodSpecs || {},
        supplementSpecs: product.supplementSpecs || {},
        medicineSpecs: product.medicineSpecs || {},
        groomingSpecs: product.groomingSpecs || {},
        costPrice: product.costPrice || 0,
        compareAtPrice: product.compareAtPrice || 0,
        profitMargin: product.profitMargin || 0,
        tax: product.tax || 0,
        shippingCost: product.shippingCost || 0,
        saleStartDate: product.saleStartDate || null,
        saleEndDate: product.saleEndDate || null,
        trackInventory: product.trackInventory !== undefined ? product.trackInventory : true,
        lowStockAlert: product.lowStockAlert || 5,
        warehouse: product.warehouse || '',
        supplier: product.supplier || '',
        allowBackorder: !!product.allowBackorder,
        reservedStock: product.reservedStock || 0,
        restockDate: product.restockDate || null,
        length: product.length || 0,
        width: product.width || 0,
        height: product.height || 0,
        shippingClass: product.shippingClass || '',
        fragile: !!product.fragile,
        freeShipping: !!product.freeShipping,
        cashOnDelivery: product.cashOnDelivery !== undefined ? product.cashOnDelivery : true,
        seoTitle: product.seoTitle || '',
        metaDescription: product.metaDescription || '',
        seoKeywords: product.seoKeywords || [],
        ogImage: product.ogImage || '',
        gtin: product.gtin || '',
        vendor: product.vendor || '',
        countryOfOrigin: product.countryOfOrigin || 'Pakistan',
        warranty: product.warranty || '',
        internalNotes: product.internalNotes || '',
        searchKeywords: product.searchKeywords || [],
        breedCompat: product.breedCompat || [],
        ageCompat: product.ageCompat || [],
        weightCompat: product.weightCompat || '',
        genderCompat: product.genderCompat || '',
        variants: product.variants || [],
        frequentlyBoughtTogether: product.frequentlyBoughtTogether || [],
        relatedProducts: product.relatedProducts || [],
        crossSell: product.crossSell || [],
        upsell: product.upsell || [],
        enableReviews: product.enableReviews !== undefined ? product.enableReviews : true,
        enableRatings: product.enableRatings !== undefined ? product.enableRatings : true,
        verifiedPurchaseOnly: product.verifiedPurchaseOnly !== undefined ? product.verifiedPurchaseOnly : true
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    res.status(201).json(mapProduct(newProduct));
  } catch (error) {
    res.status(500).json({ message: 'Error duplicating product', error: error.message });
  }
};

// @desc    Delete single product listing
// @route   DELETE /api/products/:id
// @access  Private (Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Admin access only' });
    }

    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await prisma.product.delete({ where: { id: req.params.id } });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};

// @desc    Perform bulk actions on products
// @route   POST /api/products/bulk
// @access  Private (Admin)
exports.bulkProductAction = async (req, res) => {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Admin access only' });
    }

    const { ids, action, value } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No product IDs selected' });
    }

    if (action === 'delete') {
      await prisma.product.deleteMany({
        where: { id: { in: ids } }
      });
      return res.status(200).json({ message: 'Bulk delete operation successful' });
    }

    if (action === 'status') {
      if (!['Published', 'Draft', 'Archived'].includes(value)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }
      await prisma.product.updateMany({
        where: { id: { in: ids } },
        data: { status: value }
      });
      return res.status(200).json({ message: `Bulk status update to ${value} successful` });
    }

    res.status(400).json({ message: 'Invalid bulk action operation' });
  } catch (error) {
    res.status(500).json({ message: 'Error executing bulk action', error: error.message });
  }
};
