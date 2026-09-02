const { prisma, supabase } = require('../../database/supabase/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../../utils/sendEmail');

// Token generation helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'petlink_super_secret_key_2026', {
    expiresIn: '30d',
  });
};

const mapUser = (user) => {
  if (!user) return null;
  const mapped = {
    ...user,
    _id: user.id
  };
  delete mapped.id;
  delete mapped.password;
  return mapped;
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { name, email, phone, address, role, password } = req.body;

    // Check if user already exists
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email address' });
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Register in Supabase Auth if available
    let userId = undefined;
    if (supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { name, role }
        });
        if (authError) {
          return res.status(400).json({ message: 'Supabase Auth registration failed: ' + authError.message });
        }
        userId = authData.user.id;
      } catch (authErr) {
        console.error("Supabase Auth API failure: ", authErr.message);
      }
    }

    // Create profile record in database
    const user = await prisma.user.create({
      data: {
        id: userId, // UUID string from Supabase (or default UUID if undefined)
        name,
        email,
        phone: phone || '',
        address: address || '',
        role: role || 'user',
        password: hashedPassword,
        username: '',
        recoveryEmail: '',
        gender: 'male',
        dob: '',
        city: '',
        province: '',
        country: '',
        bio: '',
        profilePic: '',
        coverPhoto: '',
        status: 'Active'
      }
    });

    const responseUser = mapUser(user);
    responseUser.token = generateToken(user.id);

    res.status(201).json(responseUser);
  } catch (error) {
    res.status(500).json({ message: 'Server registration error', error: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password credentials' });
    }

    // Verify bcrypt hash comparison
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password credentials' });
    }

    const responseUser = mapUser(user);
    responseUser.token = generateToken(user.id);

    res.status(200).json(responseUser);
  } catch (error) {
    res.status(500).json({ message: 'Server authentication error', error: error.message });
  }
};

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private / Public with userId
exports.updateUserProfile = async (req, res) => {
  try {
    const { 
      userId, name, username, recoveryEmail, phone, 
      gender, dob, address, city, province, country, 
      bio, profilePic, coverPhoto 
    } = req.body;

    let targetUserId = userId;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'petlink_super_secret_key_2026');
        if (decoded && decoded.id) {
          targetUserId = decoded.id;
        }
      } catch (err) {
        console.warn('JWT verify warning in updateUserProfile:', err.message);
      }
    }

    if (!targetUserId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found in Supabase database' });
    }

    const data = {};
    if (name !== undefined) data.name = name;
    if (username !== undefined) data.username = username;
    if (recoveryEmail !== undefined) data.recoveryEmail = recoveryEmail;
    if (phone !== undefined) data.phone = phone;
    if (gender !== undefined) data.gender = gender;
    if (dob !== undefined) data.dob = dob;
    if (address !== undefined) data.address = address;
    if (city !== undefined) data.city = city;
    if (province !== undefined) data.province = province;
    if (country !== undefined) data.country = country;
    if (bio !== undefined) data.bio = bio;
    if (profilePic !== undefined) data.profilePic = profilePic;
    if (coverPhoto !== undefined) data.coverPhoto = coverPhoto;

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data
    });

    const responseUser = mapUser(updatedUser);
    responseUser.token = generateToken(updatedUser.id);

    res.status(200).json(responseUser);
  } catch (error) {
    console.error('Supabase updateUserProfile error:', error);
    res.status(500).json({ message: 'Server update error', error: error.message });
  }
};

// @desc    Generate password reset OTP and email it
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'No user registered with this email address' });
    }

    // Generate a clean 6-digit numeric OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP and 10 minute expiration
    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: otp,
        resetPasswordExpire: new Date(Date.now() + 10 * 60 * 1000)
      }
    });

    // Send Recovery Email
    const message = `
      You are receiving this email because you (or someone else) has requested a password reset for your PetLink account.
      
      Your 6-Digit Password Reset OTP is:
      
      *** ${otp} ***
      
      If you did not request this, please ignore this email. This OTP code expires in 10 minutes.
    `;

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #E5E7EB; border-radius: 12px; max-width: 480px;">
        <h2 style="color: #0066CC; margin-bottom: 16px;">PetLink Security</h2>
        <p>You requested a password reset for your PetLink account.</p>
        <p>Please enter the following 6-digit verification code to complete the reset process:</p>
        <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; text-align: center; background-color: #F9FAFB; padding: 16px; border-radius: 8px; margin: 24px 0; color: #111827; border: 1px dashed #0066CC;">
          ${otp}
        </div>
        <p style="color: #64748B; font-size: 13px;">This verification code is valid for exactly 10 minutes. If you did not make this request, you can safely ignore this email.</p>
      </div>
    `;

    await sendEmail({
      email: user.email,
      subject: 'PetLink Account Password Recovery OTP',
      message,
      html,
    });

    res.status(200).json({ message: 'Password recovery OTP code successfully dispatched' });
  } catch (error) {
    res.status(500).json({ message: 'Forgot password operation failed', error: error.message });
  }
};

// @desc    Verify OTP and update password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        email,
        resetPasswordToken: otp,
        resetPasswordExpire: { gt: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Sync in Supabase Auth if user matches a Supabase auth record
    if (supabase) {
      try {
        await supabase.auth.admin.updateUserById(user.id, { password: newPassword });
      } catch (authErr) {
        console.error("Supabase Auth password sync failure: ", authErr.message);
      }
    }

    // Set new password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpire: null
      }
    });

    res.status(200).json({ message: 'Your password has been successfully updated' });
  } catch (error) {
    res.status(500).json({ message: 'Password reset operation failed', error: error.message });
  }
};

// @desc    Get user profile details by ID
// @route   GET /api/auth/profile/:userId
// @access  Public
exports.getUserProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(mapUser(user));
  } catch (error) {
    res.status(500).json({ message: 'Server query error', error: error.message });
  }
};

// @desc    Get all users (admin-only)
// @route   GET /api/auth/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const requesterId = req.headers['x-requester-id'];
    const requester = await prisma.user.findUnique({ where: { id: requesterId } });
    if (!requester || requester.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access only' });
    }

    const users = await prisma.user.findMany({});
    res.status(200).json(users.map(mapUser));
  } catch (error) {
    res.status(500).json({ message: 'Server query error', error: error.message });
  }
};

// @desc    Update user status (admin-only)
// @route   PUT /api/auth/users/:userId/status
// @access  Private (Admin)
exports.updateUserStatus = async (req, res) => {
  try {
    const requesterId = req.headers['x-requester-id'];
    const requester = await prisma.user.findUnique({ where: { id: requesterId } });
    if (!requester || requester.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access only' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.params.userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { status } = req.body;
    if (!['Active', 'Suspended', 'Blocked', 'Deleted', 'Pending Verification'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const updated = await prisma.user.update({
      where: { id: req.params.userId },
      data: { status }
    });

    res.status(200).json({ message: `User status updated to ${status} successfully`, user: mapUser(updated) });
  } catch (error) {
    res.status(500).json({ message: 'Server status update error', error: error.message });
  }
};

// @desc    Delete a user (admin-only)
// @route   DELETE /api/auth/users/:userId
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const requesterId = req.headers['x-requester-id'];
    const requester = await prisma.user.findUnique({ where: { id: requesterId } });
    if (!requester || requester.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access only' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.params.userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (supabase) {
      try {
        await supabase.auth.admin.deleteUser(req.params.userId);
      } catch (authErr) {
        console.error("Supabase Auth delete user failure: ", authErr.message);
      }
    }

    await prisma.user.delete({ where: { id: req.params.userId } });
    res.status(200).json({ message: 'User profile permanently deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server deletion error', error: error.message });
  }
};

// @desc    Get system analytics (admin-only)
// @route   GET /api/auth/analytics
// @access  Private (Admin)
exports.getSystemAnalytics = async (req, res) => {
  try {
    const requesterId = req.headers['x-requester-id'];
    const requester = await prisma.user.findUnique({ where: { id: requesterId } });
    if (!requester || requester.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access only' });
    }

    const totalUsers = await prisma.user.count({});
    const totalPets = await prisma.pet.count({});

    // Fetch real recent logs dynamically
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3
    });
    const recentPets = await prisma.pet.findMany({
      include: { owner: true },
      orderBy: { createdAt: 'desc' },
      take: 3
    });

    const logs = [];
    recentUsers.forEach(u => {
      logs.push({
        type: 'user',
        message: `New User account registered: ${u.name} (${u.role.replace('_', ' ')})`,
        time: u.createdAt
      });
    });
    
    recentPets.forEach(p => {
      const ownerName = p.owner ? p.owner.name : 'Unknown';
      logs.push({
        type: 'pet',
        message: `New Pet companion posted: "${p.name}" (${p.breed || p.species}) by ${ownerName}`,
        time: p.createdAt
      });
    });

    // Sort descending by time
    logs.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.status(200).json({
      users: totalUsers,
      pets: totalPets,
      listings: totalPets,
      products: 0,
      orders: 0,
      revenue: '0 PKR',
      bookings: 0,
      pendingOrders: 0,
      completedOrders: 0,
      notifications: logs.length,
      logs: logs
    });
  } catch (error) {
    res.status(500).json({ message: 'Server analytics error', error: error.message });
  }
};

// @desc    Update user role (admin-only)
// @route   PUT /api/auth/users/:userId/role
// @access  Private (Admin)
exports.updateUserRole = async (req, res) => {
  try {
    const requesterId = req.headers['x-requester-id'];
    const requester = await prisma.user.findUnique({ where: { id: requesterId } });
    if (!requester || requester.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access only' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.params.userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { role } = req.body;
    if (!['admin', 'user', 'shelter_provider'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role value' });
    }

    if (supabase) {
      try {
        await supabase.auth.admin.updateUserById(req.params.userId, { user_metadata: { role } });
      } catch (authErr) {
        console.error("Supabase Auth role sync failure: ", authErr.message);
      }
    }

    const updated = await prisma.user.update({
      where: { id: req.params.userId },
      data: { role }
    });

    res.status(200).json({ message: `User role updated to ${role} successfully`, user: mapUser(updated) });
  } catch (error) {
    res.status(500).json({ message: 'Server role update error', error: error.message });
  }
};
