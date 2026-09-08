import express from 'express';
import {
  register,
  login,
  verifyOTP,
  resendOTP,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Direct registration (NO OTP required)
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Phase 1: Validates credentials, issues OTP & pauses login
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Phase 2: Validates OTP and issues final JWT token
 */
router.post('/verify-otp', verifyOTP);

/**
 * @route   POST /api/auth/resend-otp
 * @desc    Re-issues a new OTP (rate limited to 60s cooldown)
 */
router.post('/resend-otp', resendOTP);

/**
 * @route   GET /api/auth/me
 * @desc    Protected route returning authenticated profile
 */
router.get('/me', requireAuth, (req, res) => {
  res.json({
    success: true,
    project: 'Antigravity',
    user: req.user,
  });
});

export default router;
