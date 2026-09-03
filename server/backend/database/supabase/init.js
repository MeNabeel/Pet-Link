const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

const initDB = async () => {
  try {
    console.log('Initializing PostgreSQL schema in public schema...');

    // ----------------------------------------------------
    // SHELTER TABLES
    // ----------------------------------------------------
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

    await pool.query(`
      CREATE TABLE IF NOT EXISTS shelter_wishlist (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "shelterId" UUID NOT NULL REFERENCES shelter_profiles(id) ON DELETE CASCADE,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE("userId", "shelterId")
      );
    `);

    // ----------------------------------------------------
    // CLINIC TABLES & GEOSPATIAL HELPER
    // ----------------------------------------------------
    await pool.query(`
      CREATE OR REPLACE FUNCTION calculate_distance(lat1 double precision, lon1 double precision, lat2 double precision, lon2 double precision)
      RETURNS double precision AS $$
      DECLARE
          r double precision := 6371;
          dlat double precision;
          dlon double precision;
          a double precision;
          c double precision;
      BEGIN
          IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
              RETURN 0.0;
          END IF;
          dlat := radians(lat2 - lat1);
          dlon := radians(lon2 - lon1);
          a := sin(dlat/2) * sin(dlat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2) * sin(dlon/2);
          c := 2 * atan2(sqrt(a), sqrt(1-a));
          RETURN r * c;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS clinics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL UNIQUE,
        logo TEXT DEFAULT '',
        "coverImage" TEXT DEFAULT '',
        description TEXT DEFAULT '',
        phone VARCHAR(50) DEFAULT '',
        email VARCHAR(100) DEFAULT '',
        address TEXT DEFAULT '',
        city VARCHAR(100) DEFAULT '',
        province VARCHAR(100) DEFAULT '',
        area VARCHAR(100) DEFAULT '',
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        rating DOUBLE PRECISION DEFAULT 5.0,
        "reviewCount" INTEGER DEFAULT 0,
        "startingFee" DOUBLE PRECISION DEFAULT 0,
        "emergencyPhone" VARCHAR(50) DEFAULT '',
        "providesEmergency" BOOLEAN DEFAULT FALSE,
        "isAlwaysOpen" BOOLEAN DEFAULT FALSE,
        "openingTime" VARCHAR(20) DEFAULT '09:00',
        "closingTime" VARCHAR(20) DEFAULT '21:00',
        "daysOpen" TEXT[] DEFAULT '{"Mon","Tue","Wed","Thu","Fri","Sat"}',
        facilities TEXT[] DEFAULT '{}',
        status VARCHAR(50) DEFAULT 'Active',
        "googlePlaceId" VARCHAR(255) UNIQUE,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Run Migration: Ensure googlePlaceId column is present on existing tables
    await pool.query(`
      ALTER TABLE clinics ADD COLUMN IF NOT EXISTS "googlePlaceId" VARCHAR(255) UNIQUE;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS clinic_services (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "clinicId" UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT DEFAULT '',
        price DOUBLE PRECISION DEFAULT 0,
        duration INTEGER DEFAULT 30,
        status VARCHAR(50) DEFAULT 'Active',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS clinic_doctors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "clinicId" UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        specialization VARCHAR(255) NOT NULL,
        experience INTEGER DEFAULT 0,
        image TEXT DEFAULT '',
        rating DOUBLE PRECISION DEFAULT 5.0,
        "availableDays" TEXT[] DEFAULT '{"Mon","Tue","Wed","Thu","Fri"}',
        "availableTimeStart" VARCHAR(20) DEFAULT '09:00',
        "availableTimeEnd" VARCHAR(20) DEFAULT '17:00',
        status VARCHAR(50) DEFAULT 'Active',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS clinic_appointments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "clinicId" UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
        "serviceId" UUID REFERENCES clinic_services(id) ON DELETE SET NULL,
        "doctorId" UUID REFERENCES clinic_doctors(id) ON DELETE SET NULL,
        "petId" UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
        "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "appointmentDate" DATE NOT NULL,
        "appointmentTime" VARCHAR(20) NOT NULL,
        notes TEXT DEFAULT '',
        status VARCHAR(50) DEFAULT 'Pending',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS clinic_reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "clinicId" UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
        "appointmentId" UUID NOT NULL UNIQUE REFERENCES clinic_appointments(id) ON DELETE CASCADE,
        "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL,
        comment TEXT DEFAULT '',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS clinic_wishlist (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "clinicId" UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE("userId", "clinicId")
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS clinic_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "appointmentId" UUID NOT NULL REFERENCES clinic_appointments(id) ON DELETE CASCADE,
        "senderId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "receiverId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        "isRead" BOOLEAN DEFAULT FALSE,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'General',
        "isRead" BOOLEAN DEFAULT FALSE,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_addresses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "fullName" VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        "streetAddress" TEXT NOT NULL,
        apartment TEXT DEFAULT '',
        city VARCHAR(100) NOT NULL,
        province VARCHAR(100) DEFAULT '',
        country VARCHAR(100) DEFAULT 'Pakistan',
        "postalCode" VARCHAR(20) DEFAULT '',
        "addressType" VARCHAR(50) DEFAULT 'Home',
        "isDefault" BOOLEAN DEFAULT FALSE,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_clinics_city ON clinics(city);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_clinics_status ON clinics(status);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_clinics_google_place_id ON clinics("googlePlaceId");`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_clinic_appointments_user ON clinic_appointments("userId");`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_clinic_appointments_status ON clinic_appointments(status);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_user_addresses_user ON user_addresses("userId");`);

    // ----------------------------------------------------
    // DATA SEEDING
    // ----------------------------------------------------
    const { rows: clinicsCount } = await pool.query('SELECT count(*) FROM clinics');
    if (parseInt(clinicsCount[0].count) === 0) {
      console.log('Seeding mock clinic profiles...');
      
      const clinicsData = [
        {
          name: 'DHA Animal Hospital & Emergency Care',
          logo: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&q=80&w=150',
          coverImage: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&q=80&w=800',
          description: 'Lahores premier 24/7 emergency veterinary center with advanced diagnostic lab facilities, critical care units, and experienced veterinary surgeons.',
          phone: '03001234567',
          email: 'dha@petlinkclinics.com',
          address: 'Sector XX, DHA Phase 3',
          city: 'Lahore',
          province: 'Punjab',
          area: 'DHA',
          latitude: 31.4697,
          longitude: 74.4084,
          rating: 4.9,
          reviewCount: 42,
          startingFee: 1500,
          emergencyPhone: '03009999999',
          providesEmergency: true,
          isAlwaysOpen: true,
          googlePlaceId: 'ChIJ53w4fF353zgRkC0lK6YFz5k', // A real place id for connection mapping
          facilities: '{"24/7 Emergency Room", "Surgery Room", "ICU", "Laboratory", "Pharmacy", "Waiting Area", "Parking"}'
        },
        {
          name: 'Gulberg Pet Wellness Clinic',
          logo: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=150',
          coverImage: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800',
          description: 'Specialized healthcare clinic for dogs, cats, and birds. Offering general consultations, dentistry, preventative checkups, and grooming services.',
          phone: '03217654321',
          email: 'gulberg@petlinkclinics.com',
          address: 'Block K, Gulberg 2',
          city: 'Lahore',
          province: 'Punjab',
          area: 'Gulberg',
          latitude: 31.5204,
          longitude: 74.3587,
          rating: 4.7,
          reviewCount: 28,
          startingFee: 1000,
          emergencyPhone: '',
          providesEmergency: false,
          isAlwaysOpen: false,
          googlePlaceId: 'ChIJ_yGpg60FGTkRZk99oO6xNRE',
          facilities: '{"Consultation Room", "Pharmacy", "Grooming Area", "Parking"}'
        },
        {
          name: 'Clifton Veterinary Hospital & Surgery Center',
          logo: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=150',
          coverImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800',
          description: 'Premium pet healthcare center in Clifton, Karachi. Specializing in diagnostics, ultrasound scans, orthopedics, and vaccination packages.',
          phone: '03338765432',
          email: 'clifton@petlinkclinics.com',
          address: 'Block 5, Clifton',
          city: 'Karachi',
          province: 'Sindh',
          area: 'Clifton',
          latitude: 24.8138,
          longitude: 67.0336,
          rating: 4.8,
          reviewCount: 35,
          startingFee: 1200,
          emergencyPhone: '03331112223',
          providesEmergency: true,
          isAlwaysOpen: false,
          googlePlaceId: 'ChIJm7_Bv9g9sTkRl_iN1p961-A',
          facilities: '{"Surgery Room", "Diagnostics", "Ultrasound", "X-Ray", "Pharmacy", "Parking"}'
        },
        {
          name: 'Islamabad Animal Wellness Center',
          logo: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=150',
          coverImage: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800',
          description: 'A compassionate veterinary practice in F-7 Islamabad. Focused on preventative healthcare, avian diagnostics, feline specialties, and dental surgeries.',
          phone: '03154567890',
          email: 'islamabad@petlinkclinics.com',
          address: 'Street 12, F-7/2',
          city: 'Islamabad',
          province: 'Capital',
          area: 'F-7',
          latitude: 33.7215,
          longitude: 73.0564,
          rating: 4.6,
          reviewCount: 19,
          startingFee: 900,
          emergencyPhone: '',
          providesEmergency: false,
          isAlwaysOpen: false,
          googlePlaceId: 'ChIJV4qPZ-d3tTkRs8D8T72xXwE',
          facilities: '{"Consultation Room", "Pharmacy", "Laboratory", "Parking"}'
        }
      ];

      for (const clinic of clinicsData) {
        const { rows: insertedClinic } = await pool.query(`
          INSERT INTO clinics (name, logo, "coverImage", description, phone, email, address, city, province, area, latitude, longitude, rating, "reviewCount", "startingFee", "emergencyPhone", "providesEmergency", "isAlwaysOpen", "googlePlaceId", facilities)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
          RETURNING id;
        `, [
          clinic.name, clinic.logo, clinic.coverImage, clinic.description, clinic.phone, clinic.email, clinic.address, clinic.city, clinic.province, clinic.area, clinic.latitude, clinic.longitude, clinic.rating, clinic.reviewCount, clinic.startingFee, clinic.emergencyPhone, clinic.providesEmergency, clinic.isAlwaysOpen, clinic.googlePlaceId, clinic.facilities
        ]);

        const clinicId = insertedClinic[0].id;

        const services = [
          { name: 'General Consultation', description: 'Comprehensive physical health examination and advice.', price: clinic.startingFee, duration: 20 },
          { name: 'Vaccination Package', description: 'Standard yearly core booster vaccines for dogs and cats.', price: clinic.startingFee + 1200, duration: 15 },
          { name: 'Dental Scaling & Cleaning', description: 'Preventative plaque scaling and polishing under sedation.', price: clinic.startingFee + 4000, duration: 45 },
          { name: 'Emergency Consultation', description: 'High-priority examination for critical or injured animals.', price: clinic.startingFee + 1500, duration: 30 }
        ];

        for (const s of services) {
          await pool.query(`
            INSERT INTO clinic_services ("clinicId", name, description, price, duration)
            VALUES ($1, $2, $3, $4, $5);
          `, [clinicId, s.name, s.description, s.price, s.duration]);
        }

        const doctors = [
          { name: 'Dr. Ahmed Khan', specialization: 'Veterinary Surgeon', experience: 8, image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150' },
          { name: 'Dr. Sarah Ali', specialization: 'General Physician & Feline Care', experience: 5, image: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=150' }
        ];

        for (const d of doctors) {
          await pool.query(`
            INSERT INTO clinic_doctors ("clinicId", name, specialization, experience, image)
            VALUES ($1, $2, $3, $4, $5);
          `, [clinicId, d.name, d.specialization, d.experience, d.image]);
        }
      }
      console.log('Seeded mock clinic profiles successfully.');
    } else {
      // If table exists but googlePlaceId isn't populated, let's map them
      await pool.query(`UPDATE clinics SET "googlePlaceId" = 'ChIJ53w4fF353zgRkC0lK6YFz5k' WHERE name = 'DHA Animal Hospital & Emergency Care' AND "googlePlaceId" IS NULL`);
      await pool.query(`UPDATE clinics SET "googlePlaceId" = 'ChIJ_yGpg60FGTkRZk99oO6xNRE' WHERE name = 'Gulberg Pet Wellness Clinic' AND "googlePlaceId" IS NULL`);
      await pool.query(`UPDATE clinics SET "googlePlaceId" = 'ChIJm7_Bv9g9sTkRl_iN1p961-A' WHERE name = 'Clifton Veterinary Hospital & Surgery Center' AND "googlePlaceId" IS NULL`);
      await pool.query(`UPDATE clinics SET "googlePlaceId" = 'ChIJV4qPZ-d3tTkRs8D8T72xXwE' WHERE name = 'Islamabad Animal Wellness Center' AND "googlePlaceId" IS NULL`);
    }

    console.log('All PostgreSQL tables and lookup functions checked.');
  } catch (err) {
    console.error('Error during database tables initialization:', err.message);
  }
};

module.exports = initDB;
