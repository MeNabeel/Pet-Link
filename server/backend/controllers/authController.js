const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

// Token generation helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'petlink_super_secret_key_2026', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { name, email, phone, address, role, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email address' });
    }

    // Create user in MongoDB
    const user = await User.create({
      name,
      email,
      phone,
      address,
      role,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        username: user.username || '',
        recoveryEmail: user.recoveryEmail || '',
        gender: user.gender || 'male',
        dob: user.dob || '',
        city: user.city || '',
        province: user.province || '',
        country: user.country || '',
        bio: user.bio || '',
        profilePic: user.profilePic || '',
        coverPhoto: user.coverPhoto || '',
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user registration input data' });
    }
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

    // Check email presence
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password credentials' });
    }

    // Verify bcrypt hash comparison
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password credentials' });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      username: user.username || '',
      recoveryEmail: user.recoveryEmail || '',
      gender: user.gender || 'male',
      dob: user.dob || '',
      city: user.city || '',
      province: user.province || '',
      country: user.country || '',
      bio: user.bio || '',
      profilePic: user.profilePic || '',
      coverPhoto: user.coverPhoto || '',
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server authentication error', error: error.message });
  }
};

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Public
exports.updateUserProfile = async (req, res) => {
  try {
    const { 
      userId, name, username, recoveryEmail, phone, 
      gender, dob, address, city, province, country, 
      bio, profilePic, coverPhoto 
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name || user.name;
    user.username = username !== undefined ? username : user.username;
    user.recoveryEmail = recoveryEmail !== undefined ? recoveryEmail : user.recoveryEmail;
    user.phone = phone || user.phone;
    user.gender = gender !== undefined ? gender : user.gender;
    user.dob = dob !== undefined ? dob : user.dob;
    user.address = address || user.address;
    user.city = city !== undefined ? city : user.city;
    user.province = province !== undefined ? province : user.province;
    user.country = country !== undefined ? country : user.country;
    user.bio = bio !== undefined ? bio : user.bio;
    user.profilePic = profilePic !== undefined ? profilePic : user.profilePic;
    user.coverPhoto = coverPhoto !== undefined ? coverPhoto : user.coverPhoto;

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      role: updatedUser.role,
      username: updatedUser.username,
      recoveryEmail: updatedUser.recoveryEmail,
      gender: updatedUser.gender,
      dob: updatedUser.dob,
      city: updatedUser.city,
      province: updatedUser.province,
      country: updatedUser.country,
      bio: updatedUser.bio,
      profilePic: updatedUser.profilePic,
      coverPhoto: updatedUser.coverPhoto,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server update error', error: error.message });
  }
};

// @desc    Generate password reset OTP and email it
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No user registered with this email address' });
    }

    // Generate a clean 6-digit numeric OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP and 10 minute expiration
    user.resetPasswordToken = otp;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

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

    const user = await User.findOne({
      email,
      resetPasswordToken: otp,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    // Set new password (will trigger pre-save encryption hook)
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

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
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      username: user.username || '',
      recoveryEmail: user.recoveryEmail || '',
      gender: user.gender || 'male',
      dob: user.dob || '',
      city: user.city || '',
      province: user.province || '',
      country: user.country || '',
      bio: user.bio || '',
      profilePic: user.profilePic || '',
      coverPhoto: user.coverPhoto || '',
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server query error', error: error.message });
  }
};
