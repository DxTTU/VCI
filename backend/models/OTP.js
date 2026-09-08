import mongoose from 'mongoose';

/**
 * OTP Schema for Sign-Up Flow
 * Automatically purges documents after 5 minutes (300s) via MongoDB TTL index
 */
const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email address is mandatory for OTP delivery'],
    lowercase: true,
    trim: true,
    index: true,
  },
  otp: {
    type: String,
    required: [true, 'OTP value is mandatory'],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // 5 minutes TTL
  },
});

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;
