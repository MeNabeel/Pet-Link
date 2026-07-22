const Product = require('../models/Product');
const User = require('../models/User');

// Helper to check if requester is admin
const verifyAdmin = async (req) => {
  const requesterId = req.headers['x-requester-id'];
  if (!requesterId) return false;
  const requester = await User.findById(requesterId);
  return requester && requester.role === 'admin';
};

// @desc    Get all products (with optional filtering)
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const filter = {};

    // Search query filter (matches name, brand, sku)
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { brand: { $regex: req.query.search, $options: 'i' } },
        { sku: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Category filter
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Pet Type filter
    if (req.query.petType) {
      filter.petType = req.query.petType;
    }

    // Visibility filter (for users we only show Public)
    if (req.query.visibility) {
      filter.visibility = req.query.visibility;
    }

    // Status filter (for users we only show Published)
    if (req.query.status) {
      filter.status = req.query.status;
    } else {
      // By default, exclude Archived items
      filter.status = { $ne: 'Archived' };
    }

    // Featured filter
    if (req.query.featured) {
      filter.featured = req.query.featured === 'true';
    }

    // Recommended filter
    if (req.query.recommended) {
      filter.recommended = req.query.recommended === 'true';
    }

    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });

    res.status(200).json(products);
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
    const skuExists = await Product.findOne({ sku: sku.trim() });
    if (skuExists) {
      return res.status(400).json({ message: 'SKU code already exists in catalog' });
    }

    const product = await Product.create({
      name,
      category,
      images: images || [],
      brand: brand || '',
      sku: sku.trim(),
      barcode: barcode || '',
      description: description || '',
      shortDescription: shortDescription || '',
      regularPrice: Number(regularPrice),
      salePrice: salePrice ? Number(salePrice) : null,
      discount: discount ? Number(discount) : 0,
      stockQuantity: stockQuantity !== undefined ? Number(stockQuantity) : 0,
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
      costPrice: costPrice ? Number(costPrice) : 0,
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : 0,
      profitMargin: profitMargin ? Number(profitMargin) : 0,
      tax: tax ? Number(tax) : 0,
      shippingCost: shippingCost ? Number(shippingCost) : 0,
      saleStartDate: saleStartDate || null,
      saleEndDate: saleEndDate || null,
      trackInventory: trackInventory !== undefined ? !!trackInventory : true,
      lowStockAlert: lowStockAlert !== undefined ? Number(lowStockAlert) : 5,
      warehouse: warehouse || '',
      supplier: supplier || '',
      allowBackorder: !!allowBackorder,
      reservedStock: reservedStock ? Number(reservedStock) : 0,
      restockDate: restockDate || null,
      length: length ? Number(length) : 0,
      width: width ? Number(width) : 0,
      height: height ? Number(height) : 0,
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
    });

    res.status(201).json(product);
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

    const product = await Product.findById(req.params.id);
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

    if (sku && sku.trim() !== product.sku) {
      const skuExists = await Product.findOne({ sku: sku.trim() });
      if (skuExists) {
        return res.status(400).json({ message: 'SKU code already exists in catalog' });
      }
      product.sku = sku.trim();
    }

    if (name) product.name = name;
    if (category) product.category = category;
    if (images !== undefined) product.images = images;
    if (brand !== undefined) product.brand = brand;
    if (barcode !== undefined) product.barcode = barcode;
    if (description !== undefined) product.description = description;
    if (shortDescription !== undefined) product.shortDescription = shortDescription;
    if (regularPrice !== undefined) product.regularPrice = Number(regularPrice);
    if (salePrice !== undefined) product.salePrice = salePrice ? Number(salePrice) : null;
    if (discount !== undefined) product.discount = Number(discount);
    if (stockQuantity !== undefined) product.stockQuantity = Number(stockQuantity);
    if (stockStatus) product.stockStatus = stockStatus;
    if (weight !== undefined) product.weight = weight;
    if (dimensions !== undefined) product.dimensions = dimensions;
    if (petType !== undefined) product.petType = petType;
    if (ageGroup !== undefined) product.ageGroup = ageGroup;
    if (tags !== undefined) product.tags = tags;
    if (visibility) product.visibility = visibility;
    if (featured !== undefined) product.featured = !!featured;
    if (recommended !== undefined) product.recommended = !!recommended;
    if (status) product.status = status;

    if (productType !== undefined) product.productType = productType;
    if (clothingSpecs !== undefined) product.clothingSpecs = clothingSpecs;
    if (toySpecs !== undefined) product.toySpecs = toySpecs;
    if (foodSpecs !== undefined) product.foodSpecs = foodSpecs;
    if (supplementSpecs !== undefined) product.supplementSpecs = supplementSpecs;
    if (medicineSpecs !== undefined) product.medicineSpecs = medicineSpecs;
    if (groomingSpecs !== undefined) product.groomingSpecs = groomingSpecs;

    if (costPrice !== undefined) product.costPrice = Number(costPrice);
    if (compareAtPrice !== undefined) product.compareAtPrice = Number(compareAtPrice);
    if (profitMargin !== undefined) product.profitMargin = Number(profitMargin);
    if (tax !== undefined) product.tax = Number(tax);
    if (shippingCost !== undefined) product.shippingCost = Number(shippingCost);
    if (saleStartDate !== undefined) product.saleStartDate = saleStartDate;
    if (saleEndDate !== undefined) product.saleEndDate = saleEndDate;

    if (trackInventory !== undefined) product.trackInventory = !!trackInventory;
    if (lowStockAlert !== undefined) product.lowStockAlert = Number(lowStockAlert);
    if (warehouse !== undefined) product.warehouse = warehouse;
    if (supplier !== undefined) product.supplier = supplier;
    if (allowBackorder !== undefined) product.allowBackorder = !!allowBackorder;
    if (reservedStock !== undefined) product.reservedStock = Number(reservedStock);
    if (restockDate !== undefined) product.restockDate = restockDate;

    if (length !== undefined) product.length = Number(length);
    if (width !== undefined) product.width = Number(width);
    if (height !== undefined) product.height = Number(height);
    if (shippingClass !== undefined) product.shippingClass = shippingClass;
    if (fragile !== undefined) product.fragile = !!fragile;
    if (freeShipping !== undefined) product.freeShipping = !!freeShipping;
    if (cashOnDelivery !== undefined) product.cashOnDelivery = !!cashOnDelivery;

    if (seoTitle !== undefined) product.seoTitle = seoTitle;
    if (metaDescription !== undefined) product.metaDescription = metaDescription;
    if (seoKeywords !== undefined) product.seoKeywords = seoKeywords;
    if (ogImage !== undefined) product.ogImage = ogImage;

    if (gtin !== undefined) product.gtin = gtin;
    if (vendor !== undefined) product.vendor = vendor;
    if (countryOfOrigin !== undefined) product.countryOfOrigin = countryOfOrigin;
    if (warranty !== undefined) product.warranty = warranty;
    if (internalNotes !== undefined) product.internalNotes = internalNotes;
    if (searchKeywords !== undefined) product.searchKeywords = searchKeywords;

    if (breedCompat !== undefined) product.breedCompat = breedCompat;
    if (ageCompat !== undefined) product.ageCompat = ageCompat;
    if (weightCompat !== undefined) product.weightCompat = weightCompat;
    if (genderCompat !== undefined) product.genderCompat = genderCompat;

    if (variants !== undefined) product.variants = variants;
    if (frequentlyBoughtTogether !== undefined) product.frequentlyBoughtTogether = frequentlyBoughtTogether;
    if (relatedProducts !== undefined) product.relatedProducts = relatedProducts;
    if (crossSell !== undefined) product.crossSell = crossSell;
    if (upsell !== undefined) product.upsell = upsell;

    if (enableReviews !== undefined) product.enableReviews = !!enableReviews;
    if (enableRatings !== undefined) product.enableRatings = !!enableRatings;
    if (verifiedPurchaseOnly !== undefined) product.verifiedPurchaseOnly = !!verifiedPurchaseOnly;

    await product.save();
    
    const updatedProduct = await Product.findById(product._id).populate('category', 'name slug');
    res.status(200).json(updatedProduct);
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

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product to duplicate not found' });
    }

    const randStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newSku = `${product.sku}-DUP-${randStr}`;

    const newProduct = await Product.create({
      name: `${product.name} (Copy)`,
      category: product.category,
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
    });

    const populatedProduct = await Product.findById(newProduct._id).populate('category', 'name slug');
    res.status(201).json(populatedProduct);
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

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
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
      await Product.deleteMany({ _id: { $in: ids } });
      return res.status(200).json({ message: 'Bulk delete operation successful' });
    }

    if (action === 'status') {
      if (!['Published', 'Draft', 'Archived'].includes(value)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }
      await Product.updateMany({ _id: { $in: ids } }, { $set: { status: value } });
      return res.status(200).json({ message: `Bulk status update to ${value} successful` });
    }

    res.status(400).json({ message: 'Invalid bulk action operation' });
  } catch (error) {
    res.status(500).json({ message: 'Error executing bulk action', error: error.message });
  }
};
