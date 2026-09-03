const { Pool } = require('pg');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

// Helper to extract authenticated user ID from headers or token
const extractUserId = (req) => {
  let requesterId = req.headers['x-requester-id'] || req.headers['x-user-id'] || req.user?.id;
  if (!requesterId && req.headers['authorization']) {
    try {
      const token = req.headers['authorization'].split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'petlink_super_secret_key_2026');
      if (decoded && decoded.id) requesterId = decoded.id;
    } catch (err) {
      console.warn('JWT verification warning in addressController:', err.message);
    }
  }
  return requesterId;
};

// @desc    Get all saved addresses for authenticated user
// @route   GET /api/addresses
// @access  Private
exports.getUserAddresses = async (req, res) => {
  try {
    const userId = extractUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: Missing user authentication token/ID' });
    }

    const { rows: addresses } = await pool.query(`
      SELECT * FROM user_addresses
      WHERE "userId" = $1
      ORDER BY "isDefault" DESC, "createdAt" DESC;
    `, [userId]);

    res.status(200).json(addresses || []);
  } catch (error) {
    console.error('getUserAddresses DB Error:', error);
    res.status(500).json({ message: 'Error retrieving addresses', error: error.message });
  }
};

// @desc    Add a new address
// @route   POST /api/addresses
// @access  Private
exports.createAddress = async (req, res) => {
  try {
    const userId = extractUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: Missing user authentication token/ID' });
    }

    const { 
      fullName, phone, streetAddress, apartment, 
      city, province, country, postalCode, addressType, isDefault 
    } = req.body;

    if (!fullName || !phone || !streetAddress || !city) {
      return res.status(400).json({ message: 'Required address fields are missing' });
    }

    // Check count of user's saved addresses
    const { rows: countRows } = await pool.query(
      'SELECT count(*) FROM user_addresses WHERE "userId" = $1',
      [userId]
    );
    const existingCount = parseInt(countRows[0].count, 10);
    const shouldBeDefault = isDefault || existingCount === 0;

    if (shouldBeDefault) {
      await pool.query(
        'UPDATE user_addresses SET "isDefault" = false WHERE "userId" = $1',
        [userId]
      );
    }

    const { rows: newAddress } = await pool.query(`
      INSERT INTO user_addresses (
        "userId", "fullName", phone, "streetAddress", apartment, 
        city, province, country, "postalCode", "addressType", "isDefault"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `, [
      userId,
      fullName.trim(),
      phone.trim(),
      streetAddress.trim(),
      (apartment || '').trim(),
      city.trim(),
      (province || '').trim(),
      (country || 'Pakistan').trim(),
      (postalCode || '').trim(),
      (addressType || 'Home').trim(),
      shouldBeDefault
    ]);

    res.status(201).json(newAddress[0]);
  } catch (error) {
    console.error('createAddress DB Error:', error);
    res.status(500).json({ message: 'Error creating address', error: error.message });
  }
};

// @desc    Update an existing address
// @route   PUT /api/addresses/:id
// @access  Private
exports.updateAddress = async (req, res) => {
  try {
    const userId = extractUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: Missing user authentication token/ID' });
    }

    // Check ownership
    const { rows: existing } = await pool.query(
      'SELECT * FROM user_addresses WHERE id = $1 AND "userId" = $2',
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Address not found or unauthorized' });
    }

    const { 
      fullName, phone, streetAddress, apartment, 
      city, province, country, postalCode, addressType, isDefault 
    } = req.body;

    if (isDefault) {
      await pool.query(
        'UPDATE user_addresses SET "isDefault" = false WHERE "userId" = $1 AND id != $2',
        [userId, id]
      );
    }

    const { rows: updated } = await pool.query(`
      UPDATE user_addresses
      SET 
        "fullName" = $1,
        phone = $2,
        "streetAddress" = $3,
        apartment = $4,
        city = $5,
        province = $6,
        country = $7,
        "postalCode" = $8,
        "addressType" = $9,
        "isDefault" = $10,
        "updatedAt" = NOW()
      WHERE id = $11 AND "userId" = $12
      RETURNING *;
    `, [
      (fullName || existing[0].fullName).trim(),
      (phone || existing[0].phone).trim(),
      (streetAddress || existing[0].streetAddress).trim(),
      (apartment !== undefined ? apartment : existing[0].apartment).trim(),
      (city || existing[0].city).trim(),
      (province !== undefined ? province : existing[0].province).trim(),
      (country || existing[0].country).trim(),
      (postalCode !== undefined ? postalCode : existing[0].postalCode).trim(),
      (addressType || existing[0].addressType).trim(),
      isDefault !== undefined ? isDefault : existing[0].isDefault,
      id,
      userId
    ]);

    res.status(200).json(updated[0]);
  } catch (error) {
    console.error('updateAddress DB Error:', error);
    res.status(500).json({ message: 'Error updating address', error: error.message });
  }
};

// @desc    Set an address as default
// @route   PUT /api/addresses/:id/default
// @access  Private
exports.setDefaultAddress = async (req, res) => {
  try {
    const userId = extractUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: Missing user authentication token/ID' });
    }

    const { rows: existing } = await pool.query(
      'SELECT id FROM user_addresses WHERE id = $1 AND "userId" = $2',
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Address not found' });
    }

    await pool.query(
      'UPDATE user_addresses SET "isDefault" = false WHERE "userId" = $1',
      [userId]
    );

    const { rows: updated } = await pool.query(
      'UPDATE user_addresses SET "isDefault" = true, "updatedAt" = NOW() WHERE id = $1 RETURNING *',
      [id]
    );

    res.status(200).json({ message: 'Default address updated successfully', address: updated[0] });
  } catch (error) {
    console.error('setDefaultAddress DB Error:', error);
    res.status(500).json({ message: 'Error setting default address', error: error.message });
  }
};

// @desc    Delete an address
// @route   DELETE /api/addresses/:id
// @access  Private
exports.deleteAddress = async (req, res) => {
  try {
    const userId = extractUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: Missing user authentication token/ID' });
    }

    const { rows: existing } = await pool.query(
      'SELECT * FROM user_addresses WHERE id = $1 AND "userId" = $2',
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const wasDefault = existing[0].isDefault;

    await pool.query('DELETE FROM user_addresses WHERE id = $1', [id]);

    // If deleted address was default, make the most recent remaining address the default
    if (wasDefault) {
      const { rows: remaining } = await pool.query(
        'SELECT id FROM user_addresses WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 1',
        [userId]
      );
      if (remaining.length > 0) {
        await pool.query(
          'UPDATE user_addresses SET "isDefault" = true WHERE id = $1',
          [remaining[0].id]
        );
      }
    }

    res.status(200).json({ message: 'Address deleted successfully', id });
  } catch (error) {
    console.error('deleteAddress DB Error:', error);
    res.status(500).json({ message: 'Error deleting address', error: error.message });
  }
};
