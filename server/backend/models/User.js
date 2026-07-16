const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Please provide an address'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Please select a platform role'],
      enum: {
        values: ['admin', 'buyer', 'seller', 'shelter_provider'],
        message: 'Invalid platform role selection',
      },
      default: 'buyer',
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpire: {
      type: Date,
      default: null,
    },
    username: {
      type: String,
      default: '',
    },
    recoveryEmail: {
      type: String,
      default: '',
    },
    gender: {
      type: String,
      default: 'male',
    },
    dob: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      default: '',
    },
    province: {
      type: String,
      default: '',
    },
    country: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    profilePic: {
      type: String,
      default: '',
    },
    coverPhoto: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Suspended', 'Blocked', 'Deleted', 'Pending Verification'],
      default: 'Active'
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare entered password with hashed database password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
