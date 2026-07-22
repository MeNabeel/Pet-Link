const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please select a category'],
    },
    images: {
      type: [String],
      default: [],
    },
    brand: {
      type: String,
      default: '',
    },
    sku: {
      type: String,
      required: [true, 'Please provide an SKU'],
      unique: true,
      trim: true,
    },
    barcode: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    shortDescription: {
      type: String,
      default: '',
    },
    regularPrice: {
      type: Number,
      required: [true, 'Please specify a regular price'],
      min: 0,
    },
    salePrice: {
      type: Number,
      default: null,
    },
    discount: {
      type: Number,
      default: 0,
    },
    stockQuantity: {
      type: Number,
      default: 0,
    },
    stockStatus: {
      type: String,
      enum: ['In Stock', 'Out of Stock', 'Low Stock'],
      default: 'In Stock',
    },
    weight: {
      type: String,
      default: '',
    },
    dimensions: {
      type: String,
      default: '',
    },
    petType: {
      type: String,
      default: '',
    },
    ageGroup: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    sizes: {
      type: [String],
      default: [],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Unisex', ''],
      default: '',
    },
    visibility: {
      type: String,
      enum: ['Public', 'Hidden'],
      default: 'Public',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    recommended: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['Published', 'Draft', 'Archived'],
      default: 'Published',
    },
    // Smart Type fields
    productType: {
      type: String,
      default: 'Other'
    },
    clothingSpecs: { type: mongoose.Schema.Types.Mixed, default: {} },
    toySpecs: { type: mongoose.Schema.Types.Mixed, default: {} },
    foodSpecs: { type: mongoose.Schema.Types.Mixed, default: {} },
    supplementSpecs: { type: mongoose.Schema.Types.Mixed, default: {} },
    medicineSpecs: { type: mongoose.Schema.Types.Mixed, default: {} },
    groomingSpecs: { type: mongoose.Schema.Types.Mixed, default: {} },

    // Pricing
    costPrice: { type: Number, default: 0 },
    compareAtPrice: { type: Number, default: 0 },
    profitMargin: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    saleStartDate: { type: Date, default: null },
    saleEndDate: { type: Date, default: null },

    // Inventory
    trackInventory: { type: Boolean, default: true },
    lowStockAlert: { type: Number, default: 5 },
    warehouse: { type: String, default: '' },
    supplier: { type: String, default: '' },
    allowBackorder: { type: Boolean, default: false },
    reservedStock: { type: Number, default: 0 },
    restockDate: { type: Date, default: null },

    // Shipping
    length: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    shippingClass: { type: String, default: '' },
    fragile: { type: Boolean, default: false },
    freeShipping: { type: Boolean, default: false },
    cashOnDelivery: { type: Boolean, default: true },

    // SEO
    seoTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    seoKeywords: { type: [String], default: [] },
    ogImage: { type: String, default: '' },

    // General Improvements
    gtin: { type: String, default: '' },
    vendor: { type: String, default: '' },
    countryOfOrigin: { type: String, default: 'Pakistan' },
    warranty: { type: String, default: '' },
    internalNotes: { type: String, default: '' },
    searchKeywords: { type: [String], default: [] },

    // Pet Compatibility
    breedCompat: { type: [String], default: [] },
    ageCompat: { type: [String], default: [] },
    weightCompat: { type: String, default: '' },
    genderCompat: { type: String, default: '' },

    // Variants
    variants: {
      type: [
        {
          sku: String,
          stock: Number,
          price: Number,
          image: String,
          color: String,
          size: String,
          flavor: String,
          weight: String,
          material: String,
        }
      ],
      default: []
    },

    // Recommendations
    frequentlyBoughtTogether: { type: [String], default: [] },
    relatedProducts: { type: [String], default: [] },
    crossSell: { type: [String], default: [] },
    upsell: { type: [String], default: [] },

    // Reviews
    enableReviews: { type: Boolean, default: true },
    enableRatings: { type: Boolean, default: true },
    verifiedPurchaseOnly: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
