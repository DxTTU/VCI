import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { hashOTP } from '../utils/otpService.js';

/**
 * Antigravity User Schema
 * Implements two-stage login with hashed OTP challenge
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User full name is mandatory'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is mandatory'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid RFC-compliant email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is mandatory'],
      minlength: [6, 'Password must be at least 6 characters in length'],
      select: false, // Omit from default queries for security
    },
    role: {
      type: String,
      enum: ['member', 'admin', 'user', 'operator'],
      default: 'member',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // OTP Challenge State (Triggered ONLY during sign-in)
    otp: {
      hash: {
        type: String,
        default: null,
      },
      expiresAt: {
        type: Date,
        default: null,
      },
      attempts: {
        type: Number,
        default: 0,
      },
      lastSentAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: Hash password before writing to MongoDB
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare candidate password during Phase 1 Login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Set and hash OTP on the user document
userSchema.methods.setOTP = function (rawOtp, validityMinutes = 5) {
  this.otp = {
    hash: hashOTP(rawOtp),
    expiresAt: new Date(Date.now() + validityMinutes * 60 * 1000),
    attempts: 0,
    lastSentAt: new Date(),
  };
};

// Verify user provided OTP against stored hash
userSchema.methods.verifyOTP = function (candidateOtp) {
  if (!this.otp || !this.otp.hash || !this.otp.expiresAt) {
    return { valid: false, reason: 'NO_ACTIVE_OTP' };
  }

  // Check Expiry
  if (new Date() > this.otp.expiresAt) {
    return { valid: false, reason: 'EXPIRED' };
  }

  // Check Brute Force Throttling (Max 3 failed attempts)
  if (this.otp.attempts >= 3) {
    return { valid: false, reason: 'MAX_ATTEMPTS_EXCEEDED' };
  }

  const candidateHash = hashOTP(candidateOtp);
  const isMatch = this.otp.hash === candidateHash;

  if (!isMatch) {
    this.otp.attempts += 1;
    return { valid: false, reason: 'INVALID_CODE', remainingAttempts: 3 - this.otp.attempts };
  }

  return { valid: true };
};

// Clear OTP state upon successful verification
userSchema.methods.clearOTP = function () {
  this.otp = {
    hash: null,
    expiresAt: null,
    attempts: 0,
    lastSentAt: null,
  };
};

const User = mongoose.model('User', userSchema);

export default User;
