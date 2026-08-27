const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

const initDB = async () => {
  try {
    console.log('Initializing Shelter Provider PostgreSQL tables in public schema...');

    // 1. Create shelter_profiles
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shelter_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL UNIQUE,
        logo TEXT DEFAULT '',
        description TEXT DEFAULT '',
        phone VARCHAR(50) DEFAULT '',
        email VARCHAR(100) DEFAULT '',
        address TEXT DEFAULT '',
        country VARCHAR(100) DEFAULT 'Pakistan',
        province VARCHAR(100) DEFAULT '',
        city VARCHAR(100) DEFAULT '',
        area VARCHAR(100) DEFAULT '',
        "postalCode" VARCHAR(20) DEFAULT '',
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        "shelterTypes" TEXT[] DEFAULT '{}',
        "acceptedSpecies" TEXT[] DEFAULT '{}',
        "acceptedBreeds" TEXT[] DEFAULT '{}',
        capacity INTEGER DEFAULT 0,
        "occupiedSpaces" INTEGER DEFAULT 0,
        facilities TEXT[] DEFAULT '{}',
        "providesPickup" BOOLEAN DEFAULT FALSE,
        "pickupServiceType" VARCHAR(50) DEFAULT 'None',
        "pickupRadius" DOUBLE PRECISION DEFAULT 0,
        "pickupFee" DOUBLE PRECISION DEFAULT 0,
        "pickupFeeType" VARCHAR(20) DEFAULT 'Free',
        "pickupFeePerKm" DOUBLE PRECISION DEFAULT 0,
        "pickupAreas" TEXT[] DEFAULT '{}',
        "dailyRate" DOUBLE PRECISION DEFAULT 0,
        "weeklyRate" DOUBLE PRECISION DEFAULT 0,
        "monthlyRate" DOUBLE PRECISION DEFAULT 0,
        "dayCareRate" DOUBLE PRECISION DEFAULT 0,
        "overnightRate" DOUBLE PRECISION DEFAULT 0,
        "dropOffFee" DOUBLE PRECISION DEFAULT 0,
        "openingTime" VARCHAR(20) DEFAULT '',
        "closingTime" VARCHAR(20) DEFAULT '',
        "daysOpen" TEXT[] DEFAULT '{}',
        "isAlwaysOpen" BOOLEAN DEFAULT FALSE,
        "checkInTime" VARCHAR(20) DEFAULT '',
        "checkOutTime" VARCHAR(20) DEFAULT '',
        "pickupHours" VARCHAR(100) DEFAULT '',
        "dropOffHours" VARCHAR(100) DEFAULT '',
        rules TEXT[] DEFAULT '{}',
        status VARCHAR(50) DEFAULT 'Pending Approval',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 2. Create shelter_services
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shelter_services (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "shelterId" UUID NOT NULL REFERENCES shelter_profiles(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT DEFAULT '',
        images TEXT[] DEFAULT '{}',
        "acceptedPetTypes" TEXT[] DEFAULT '{}',
        "maxCapacity" INTEGER DEFAULT 0,
        "dailyRate" DOUBLE PRECISION DEFAULT 0,
        facilities TEXT[] DEFAULT '{}',
        address TEXT DEFAULT '',
        city VARCHAR(100) DEFAULT '',
        province VARCHAR(100) DEFAULT '',
        availability VARCHAR(50) DEFAULT 'Available',
        status VARCHAR(50) DEFAULT 'Active',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 3. Create shelter_bookings
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shelter_bookings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "shelterId" UUID NOT NULL REFERENCES shelter_profiles(id) ON DELETE CASCADE,
        "serviceId" UUID REFERENCES shelter_services(id) ON DELETE SET NULL,
        "petId" UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
        "ownerId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "checkInDate" TIMESTAMP WITH TIME ZONE NOT NULL,
        "checkOutDate" TIMESTAMP WITH TIME ZONE NOT NULL,
        duration INTEGER NOT NULL,
        "pickupOption" VARCHAR(50) DEFAULT 'No Pickup',
        "pickupAddress" TEXT DEFAULT '',
        "pickupStatus" VARCHAR(50) DEFAULT 'Requested',
        "specialInstructions" TEXT DEFAULT '',
        "totalAmount" DOUBLE PRECISION DEFAULT 0,
        "pickupFee" DOUBLE PRECISION DEFAULT 0,
        status VARCHAR(50) DEFAULT 'Pending',
        "rejectionReason" TEXT DEFAULT '',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 4. Create shelter_messages
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shelter_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "bookingId" UUID NOT NULL REFERENCES shelter_bookings(id) ON DELETE CASCADE,
        "senderId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "receiverId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        "isRead" BOOLEAN DEFAULT FALSE,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 5. Create shelter_reviews
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shelter_reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "shelterId" UUID NOT NULL REFERENCES shelter_profiles(id) ON DELETE CASCADE,
        "bookingId" UUID NOT NULL UNIQUE REFERENCES shelter_bookings(id) ON DELETE CASCADE,
        "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL,
        comment TEXT DEFAULT '',
        response TEXT DEFAULT '',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 6. Create shelter_wishlist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shelter_wishlist (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "shelterId" UUID NOT NULL REFERENCES shelter_profiles(id) ON DELETE CASCADE,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE("userId", "shelterId")
      );
    `);

    // 7. Add indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_shelter_profiles_name ON shelter_profiles(name);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_shelter_profiles_city ON shelter_profiles(city);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_shelter_profiles_status ON shelter_profiles(status);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_shelter_bookings_status ON shelter_bookings(status);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_shelter_bookings_owner ON shelter_bookings("ownerId");`);

    console.log('Shelter Provider PostgreSQL tables initialized successfully.');
  } catch (err) {
    console.error('Error during database tables initialization:', err.message);
  }
};

module.exports = initDB;
