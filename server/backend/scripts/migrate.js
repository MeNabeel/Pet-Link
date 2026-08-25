const mongoose = require('mongoose');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Prisma
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Map to store Mongo ID -> UUID conversions
const idMap = new Map();

function mongoIdToUuid(mongoId) {
  if (!mongoId) return null;
  const str = mongoId.toString();
  if (idMap.has(str)) {
    return idMap.get(str);
  }
  // Deterministic UUID from Mongo ID using MD5
  const hash = crypto.createHash('md5').update(str).digest('hex');
  const uuid = `${hash.substring(0, 8)}-${hash.substring(8, 12)}-4${hash.substring(13, 16)}-a${hash.substring(17, 20)}-${hash.substring(20, 32)}`;
  idMap.set(str, uuid);
  return uuid;
}

async function runMigration() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/petlink');
  console.log('Connected to MongoDB successfully!');

  // Load Mongo Models
  const UserMongo = require('../models/User');
  const CategoryMongo = require('../models/Category');
  const PetMongo = require('../models/Pet');
  const ProductMongo = require('../models/Product');
  const ReportMongo = require('../models/Report');
  const WishlistMongo = require('../models/Wishlist');

  // --- 1. MIGRATE USERS ---
  console.log('Fetching Users from MongoDB...');
  const users = await UserMongo.find({});
  console.log(`Found ${users.length} users to migrate.`);
  for (const u of users) {
    const uuid = mongoIdToUuid(u._id);
    await prisma.user.upsert({
      where: { id: uuid },
      update: {
        name: u.name,
        email: u.email,
        phone: u.phone || '',
        address: u.address || '',
        role: u.role || 'buyer',
        password: u.password,
        username: u.username || '',
        recoveryEmail: u.recoveryEmail || '',
        gender: u.gender || 'male',
        dob: u.dob || '',
        city: u.city || '',
        province: u.province || '',
        country: u.country || '',
        bio: u.bio || '',
        profilePic: u.profilePic || '',
        coverPhoto: u.coverPhoto || '',
        status: u.status || 'Active',
      },
      create: {
        id: uuid,
        name: u.name,
        email: u.email,
        phone: u.phone || '',
        address: u.address || '',
        role: u.role || 'buyer',
        password: u.password,
        username: u.username || '',
        recoveryEmail: u.recoveryEmail || '',
        gender: u.gender || 'male',
        dob: u.dob || '',
        city: u.city || '',
        province: u.province || '',
        country: u.country || '',
        bio: u.bio || '',
        profilePic: u.profilePic || '',
        coverPhoto: u.coverPhoto || '',
        status: u.status || 'Active',
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
      }
    });
  }
  console.log('Users migration completed.');

  // --- 2. MIGRATE CATEGORIES ---
  console.log('Fetching Categories from MongoDB...');
  const categories = await CategoryMongo.find({});
  console.log(`Found ${categories.length} categories to migrate.`);
  
  // First pass: create categories without parent reference to avoid foreign key violations
  for (const c of categories) {
    const uuid = mongoIdToUuid(c._id);
    await prisma.category.upsert({
      where: { id: uuid },
      update: {
        name: c.name,
        slug: c.slug,
        description: c.description || '',
        image: c.image || '',
        displayOrder: c.displayOrder || 0,
        featured: !!c.featured,
        showOnHomepage: !!c.showOnHomepage,
        status: c.status || 'Active',
      },
      create: {
        id: uuid,
        name: c.name,
        slug: c.slug,
        description: c.description || '',
        image: c.image || '',
        displayOrder: c.displayOrder || 0,
        featured: !!c.featured,
        showOnHomepage: !!c.showOnHomepage,
        status: c.status || 'Active',
        createdAt: c.createdAt,
        updatedAt: c.updatedAt
      }
    });
  }

  // Second pass: set parent category IDs
  for (const c of categories) {
    if (c.parentCategory) {
      const uuid = mongoIdToUuid(c._id);
      const parentUuid = mongoIdToUuid(c.parentCategory);
      await prisma.category.update({
        where: { id: uuid },
        data: { parentCategoryId: parentUuid }
      });
    }
  }
  console.log('Categories migration completed.');

  // --- 3. MIGRATE PETS ---
  console.log('Fetching Pets from MongoDB...');
  const pets = await PetMongo.find({});
  console.log(`Found ${pets.length} pets to migrate.`);
  for (const p of pets) {
    const uuid = mongoIdToUuid(p._id);
    const ownerUuid = mongoIdToUuid(p.owner);
    await prisma.pet.upsert({
      where: { id: uuid },
      update: {
        ownerId: ownerUuid,
        name: p.name,
        species: p.species || 'Dog',
        breed: p.breed,
        age: p.age,
        weight: p.weight,
        gender: p.gender,
        color: p.color || '',
        size: p.size || '',
        isVaccinated: !!p.isVaccinated,
        vaccinationDate: p.vaccinationDate || '',
        nextVaccinationDate: p.nextVaccinationDate || '',
        medicalHistory: p.medicalHistory || '',
        allergies: p.allergies || '',
        diseases: p.diseases || '',
        bloodGroup: p.bloodGroup || '',
        friendlyWithKids: !!p.friendlyWithKids,
        friendlyWithPets: !!p.friendlyWithPets,
        trainingLevel: p.trainingLevel || 'None',
        neuteredSpayed: !!p.neuteredSpayed,
        microchipNumber: p.microchipNumber || '',
        foodPreference: p.foodPreference || '',
        behaviour: p.behaviour || '',
        personality: p.personality || '',
        aboutPet: p.aboutPet || '',
        adoptionStatus: p.adoptionStatus || 'Available',
        activeStatus: p.activeStatus || 'ACTIVE',
        country: p.country || 'Pakistan',
        province: p.province || 'Punjab',
        city: p.city || 'Lahore',
        address: p.address || '',
        image: p.image || '',
        imageSettings: p.imageSettings || {},
        documents: p.documents || [],
        price: p.price || 0,
        negotiable: p.negotiable !== undefined ? p.negotiable : true,
        vaccines: p.vaccines || [],
        medicalRecords: p.medicalRecords || [],
        moderationStatus: p.moderationStatus || 'Pending Review',
        isFeatured: !!p.isFeatured,
        viewsCount: p.viewsCount || 0,
        favoritesCount: p.favoritesCount || 0,
        reportsCount: p.reportsCount || 0
      },
      create: {
        id: uuid,
        ownerId: ownerUuid,
        name: p.name,
        species: p.species || 'Dog',
        breed: p.breed,
        age: p.age,
        weight: p.weight,
        gender: p.gender,
        color: p.color || '',
        size: p.size || '',
        isVaccinated: !!p.isVaccinated,
        vaccinationDate: p.vaccinationDate || '',
        nextVaccinationDate: p.nextVaccinationDate || '',
        medicalHistory: p.medicalHistory || '',
        allergies: p.allergies || '',
        diseases: p.diseases || '',
        bloodGroup: p.bloodGroup || '',
        friendlyWithKids: !!p.friendlyWithKids,
        friendlyWithPets: !!p.friendlyWithPets,
        trainingLevel: p.trainingLevel || 'None',
        neuteredSpayed: !!p.neuteredSpayed,
        microchipNumber: p.microchipNumber || '',
        foodPreference: p.foodPreference || '',
        behaviour: p.behaviour || '',
        personality: p.personality || '',
        aboutPet: p.aboutPet || '',
        adoptionStatus: p.adoptionStatus || 'Available',
        activeStatus: p.activeStatus || 'ACTIVE',
        country: p.country || 'Pakistan',
        province: p.province || 'Punjab',
        city: p.city || 'Lahore',
        address: p.address || '',
        image: p.image || '',
        imageSettings: p.imageSettings || {},
        documents: p.documents || [],
        price: p.price || 0,
        negotiable: p.negotiable !== undefined ? p.negotiable : true,
        vaccines: p.vaccines || [],
        medicalRecords: p.medicalRecords || [],
        moderationStatus: p.moderationStatus || 'Pending Review',
        isFeatured: !!p.isFeatured,
        viewsCount: p.viewsCount || 0,
        favoritesCount: p.favoritesCount || 0,
        reportsCount: p.reportsCount || 0,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
      }
    });
  }
  console.log('Pets migration completed.');

  // --- 4. MIGRATE PRODUCTS ---
  console.log('Fetching Products from MongoDB...');
  const products = await ProductMongo.find({});
  console.log(`Found ${products.length} products to migrate.`);
  for (const pr of products) {
    const uuid = mongoIdToUuid(pr._id);
    const categoryUuid = mongoIdToUuid(pr.category);
    await prisma.product.upsert({
      where: { id: uuid },
      update: {
        name: pr.name,
        categoryId: categoryUuid,
        images: pr.images || [],
        brand: pr.brand || '',
        sku: pr.sku,
        barcode: pr.barcode || '',
        description: pr.description || '',
        shortDescription: pr.shortDescription || '',
        regularPrice: pr.regularPrice || 0,
        salePrice: pr.salePrice,
        discount: pr.discount || 0,
        stockQuantity: pr.stockQuantity || 0,
        stockStatus: pr.stockStatus || 'In Stock',
        weight: pr.weight || '',
        dimensions: pr.dimensions || '',
        petType: pr.petType || '',
        ageGroup: pr.ageGroup || '',
        tags: pr.tags || [],
        visibility: pr.visibility || 'Public',
        featured: !!pr.featured,
        recommended: !!pr.recommended,
        status: pr.status || 'Published',
        productType: pr.productType || 'Other',
        clothingSpecs: pr.clothingSpecs || {},
        toySpecs: pr.toySpecs || {},
        foodSpecs: pr.foodSpecs || {},
        supplementSpecs: pr.supplementSpecs || {},
        medicineSpecs: pr.medicineSpecs || {},
        groomingSpecs: pr.groomingSpecs || {},
        costPrice: pr.costPrice || 0,
        compareAtPrice: pr.compareAtPrice || 0,
        profitMargin: pr.profitMargin || 0,
        tax: pr.tax || 0,
        shippingCost: pr.shippingCost || 0,
        saleStartDate: pr.saleStartDate || null,
        saleEndDate: pr.saleEndDate || null,
        trackInventory: pr.trackInventory !== undefined ? !!pr.trackInventory : true,
        lowStockAlert: pr.lowStockAlert !== undefined ? pr.lowStockAlert : 5,
        warehouse: pr.warehouse || '',
        supplier: pr.supplier || '',
        allowBackorder: !!pr.allowBackorder,
        reservedStock: pr.reservedStock || 0,
        restockDate: pr.restockDate || null,
        length: pr.length || 0,
        width: pr.width || 0,
        height: pr.height || 0,
        shippingClass: pr.shippingClass || '',
        fragile: !!pr.fragile,
        freeShipping: !!pr.freeShipping,
        cashOnDelivery: pr.cashOnDelivery !== undefined ? !!pr.cashOnDelivery : true,
        seoTitle: pr.seoTitle || '',
        metaDescription: pr.metaDescription || '',
        seoKeywords: pr.seoKeywords || [],
        ogImage: pr.ogImage || '',
        gtin: pr.gtin || '',
        vendor: pr.vendor || '',
        countryOfOrigin: pr.countryOfOrigin || 'Pakistan',
        warranty: pr.warranty || '',
        internalNotes: pr.internalNotes || '',
        searchKeywords: pr.searchKeywords || [],
        breedCompat: pr.breedCompat || [],
        ageCompat: pr.ageCompat || [],
        weightCompat: pr.weightCompat || '',
        genderCompat: pr.genderCompat || '',
        variants: pr.variants || [],
        frequentlyBoughtTogether: pr.frequentlyBoughtTogether || [],
        relatedProducts: pr.relatedProducts || [],
        crossSell: pr.crossSell || [],
        upsell: pr.upsell || [],
        enableReviews: pr.enableReviews !== undefined ? !!pr.enableReviews : true,
        enableRatings: pr.enableRatings !== undefined ? !!pr.enableRatings : true,
        verifiedPurchaseOnly: pr.verifiedPurchaseOnly !== undefined ? !!pr.verifiedPurchaseOnly : true
      },
      create: {
        id: uuid,
        name: pr.name,
        categoryId: categoryUuid,
        images: pr.images || [],
        brand: pr.brand || '',
        sku: pr.sku,
        barcode: pr.barcode || '',
        description: pr.description || '',
        shortDescription: pr.shortDescription || '',
        regularPrice: pr.regularPrice || 0,
        salePrice: pr.salePrice,
        discount: pr.discount || 0,
        stockQuantity: pr.stockQuantity || 0,
        stockStatus: pr.stockStatus || 'In Stock',
        weight: pr.weight || '',
        dimensions: pr.dimensions || '',
        petType: pr.petType || '',
        ageGroup: pr.ageGroup || '',
        tags: pr.tags || [],
        visibility: pr.visibility || 'Public',
        featured: !!pr.featured,
        recommended: !!pr.recommended,
        status: pr.status || 'Published',
        productType: pr.productType || 'Other',
        clothingSpecs: pr.clothingSpecs || {},
        toySpecs: pr.toySpecs || {},
        foodSpecs: pr.foodSpecs || {},
        supplementSpecs: pr.supplementSpecs || {},
        medicineSpecs: pr.medicineSpecs || {},
        groomingSpecs: pr.groomingSpecs || {},
        costPrice: pr.costPrice || 0,
        compareAtPrice: pr.compareAtPrice || 0,
        profitMargin: pr.profitMargin || 0,
        tax: pr.tax || 0,
        shippingCost: pr.shippingCost || 0,
        saleStartDate: pr.saleStartDate || null,
        saleEndDate: pr.saleEndDate || null,
        trackInventory: pr.trackInventory !== undefined ? !!pr.trackInventory : true,
        lowStockAlert: pr.lowStockAlert !== undefined ? pr.lowStockAlert : 5,
        warehouse: pr.warehouse || '',
        supplier: pr.supplier || '',
        allowBackorder: !!pr.allowBackorder,
        reservedStock: pr.reservedStock || 0,
        restockDate: pr.restockDate || null,
        length: pr.length || 0,
        width: pr.width || 0,
        height: pr.height || 0,
        shippingClass: pr.shippingClass || '',
        fragile: !!pr.fragile,
        freeShipping: !!pr.freeShipping,
        cashOnDelivery: pr.cashOnDelivery !== undefined ? !!pr.cashOnDelivery : true,
        seoTitle: pr.seoTitle || '',
        metaDescription: pr.metaDescription || '',
        seoKeywords: pr.seoKeywords || [],
        ogImage: pr.ogImage || '',
        gtin: pr.gtin || '',
        vendor: pr.vendor || '',
        countryOfOrigin: pr.countryOfOrigin || 'Pakistan',
        warranty: pr.warranty || '',
        internalNotes: pr.internalNotes || '',
        searchKeywords: pr.searchKeywords || [],
        breedCompat: pr.breedCompat || [],
        ageCompat: pr.ageCompat || [],
        weightCompat: pr.weightCompat || '',
        genderCompat: pr.genderCompat || '',
        variants: pr.variants || [],
        frequentlyBoughtTogether: pr.frequentlyBoughtTogether || [],
        relatedProducts: pr.relatedProducts || [],
        crossSell: pr.crossSell || [],
        upsell: pr.upsell || [],
        enableReviews: pr.enableReviews !== undefined ? !!pr.enableReviews : true,
        enableRatings: pr.enableRatings !== undefined ? !!pr.enableRatings : true,
        verifiedPurchaseOnly: pr.verifiedPurchaseOnly !== undefined ? !!pr.verifiedPurchaseOnly : true,
        createdAt: pr.createdAt,
        updatedAt: pr.updatedAt
      }
    });
  }
  console.log('Products migration completed.');

  // --- 5. MIGRATE REPORTS ---
  console.log('Fetching Reports from MongoDB...');
  const reports = await ReportMongo.find({});
  console.log(`Found ${reports.length} reports to migrate.`);
  for (const r of reports) {
    const uuid = mongoIdToUuid(r._id);
    const reporterUuid = mongoIdToUuid(r.reporter);
    const petUuid = mongoIdToUuid(r.pet);
    await prisma.report.upsert({
      where: { id: uuid },
      update: {
        reporterId: reporterUuid,
        petId: petUuid,
        reason: r.reason,
        status: r.status || 'Pending'
      },
      create: {
        id: uuid,
        reporterId: reporterUuid,
        petId: petUuid,
        reason: r.reason,
        status: r.status || 'Pending',
        createdAt: r.createdAt,
        updatedAt: r.updatedAt
      }
    });
  }
  console.log('Reports migration completed.');

  // --- 6. MIGRATE WISHLIST ---
  console.log('Fetching Wishlists from MongoDB...');
  const wishlists = await WishlistMongo.find({});
  console.log(`Found ${wishlists.length} wishlist records to migrate.`);
  for (const w of wishlists) {
    const uuid = mongoIdToUuid(w._id);
    const userUuid = mongoIdToUuid(w.user);
    const petUuid = mongoIdToUuid(w.pet);
    await prisma.wishlist.upsert({
      where: { id: uuid },
      update: {
        userId: userUuid,
        petId: petUuid
      },
      create: {
        id: uuid,
        userId: userUuid,
        petId: petUuid,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt
      }
    });
  }
  console.log('Wishlists migration completed.');

  console.log('Disconnecting database connections...');
  await mongoose.disconnect();
  await prisma.$disconnect();
  console.log('Data migration executed successfully!');
}

runMigration().catch(err => {
  console.error('Migration failed with critical error:', err);
  process.exit(1);
});
