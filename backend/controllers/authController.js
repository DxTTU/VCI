import User from '../models/User.js';
import {
  generateSecureOTP,
  signPreAuthToken,
  verifyPreAuthToken,
  signAccessToken,
  verifyAccessToken,
  sendOTPEmail,
} from '../utils/otpService.js';

import Member from '../models/Member.js';

/**
 * Mask email address for secure client response (e.g. j***e@example.com)
 */
const maskEmail = (email) => {
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  return `${local[0]}${'*'.repeat(local.length - 2)}${local.slice(-1)}@${domain}`;
};

/**
 * 1. User Registration (Signup)
 * NOTE: As per project spec, NO OTP is required during registration.
 * User enters details, password is encrypted, and account is immediately registered.
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters in length.',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Create user (pre-save hook hashes password with bcrypt)
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || 'user',
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully in Antigravity. Please proceed to sign in.',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('[ANTIGRAVITY // REGISTER ERROR]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 2. Sign-In Initiation (Phase 1)
 * User provides email or Member ID and password.
 * If credentials are valid, generates OTP, dispatches it, and PAUSES login.
 */
export const login = async (req, res) => {
  try {
    const { email, identifier, password } = req.body;
    const loginId = (identifier || email || '').trim();

    if (!loginId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both Member ID/Email and password.',
      });
    }

    // Resolve email if user entered a Member ID (e.g. V-100201)
    let searchEmail = loginId.toLowerCase();
    if (!loginId.includes('@')) {
      const member = await Member.findOne({ memberId: loginId.toUpperCase() });
      if (member && member.email) {
        searchEmail = member.email.toLowerCase().trim();
      }
    }

    // Query user and explicitly select hidden password field
    const user = await User.findOne({ email: searchEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Please contact administrator.',
      });
    }

    // Verify Password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    // CREDENTIALS VALID: Generate OTP and pause login
    const rawOtp = generateSecureOTP();
    user.setOTP(rawOtp, 5); // 5 minutes expiration
    await user.save();

    // Dispatch OTP (Email / Notification)
    await sendOTPEmail(user.email, rawOtp);

    // Issue short-lived Pre-Auth Token (10 minutes)
    const preAuthToken = signPreAuthToken(user._id.toString(), user.email);

    // Pause login and prompt client for OTP
    return res.status(200).json({
      success: true,
      status: 'OTP_REQUIRED',
      message: 'Credentials authenticated. A 6-digit verification code has been dispatched to your email.',
      preAuthToken,
      maskedEmail: maskEmail(user.email),
      expiresInSeconds: 300,
      devOtp: rawOtp,
    });
  } catch (error) {
    console.error('[ANTIGRAVITY // LOGIN ERROR]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 3. Verify OTP (Phase 2)
 * Validates the temporary Pre-Auth Token and user-entered OTP.
 * On success, clears OTP state and issues production session JWT.
 */
export const verifyOTP = async (req, res) => {
  try {
    const { otp, preAuthToken: bodyToken } = req.body;
    
    // Extract Pre-Auth Token from Authorization header or body
    const authHeader = req.headers.authorization;
    const preAuthToken =
      authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : bodyToken;

    if (!preAuthToken) {
      return res.status(401).json({
        success: false,
        message: 'Missing verification session token (preAuthToken). Please log in again.',
      });
    }

    if (!otp || otp.toString().trim().length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 6-digit numerical OTP.',
      });
    }

    // Verify Pre-Auth Token
    const decoded = verifyPreAuthToken(preAuthToken);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Verification session has expired or is invalid. Please sign in again.',
      });
    }

    // Fetch user with OTP subdocument
    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not located.',
      });
    }

    // Run verification checks on hashed OTP
    const verification = user.verifyOTP(otp.toString().trim());

    if (!verification.valid) {
      await user.save(); // Persist attempt counter

      switch (verification.reason) {
        case 'EXPIRED':
          return res.status(400).json({
            success: false,
            code: 'OTP_EXPIRED',
            message: 'Verification code has expired. Please request a new code.',
          });
        case 'MAX_ATTEMPTS_EXCEEDED':
          return res.status(429).json({
            success: false,
            code: 'MAX_ATTEMPTS_EXCEEDED',
            message: 'Maximum verification attempts exceeded. Please initiate a new login.',
          });
        case 'INVALID_CODE':
          return res.status(400).json({
            success: false,
            code: 'INVALID_OTP',
            message: `Invalid verification code. ${verification.remainingAttempts} attempt(s) remaining.`,
            remainingAttempts: verification.remainingAttempts,
          });
        default:
          return res.status(400).json({
            success: false,
            message: 'No active OTP verification session found. Please sign in again.',
          });
      }
    }

    // OTP VERIFIED: Clear OTP state and save
    user.clearOTP();
    await user.save();

    // Issue production Access Token
    const token = signAccessToken(user);

    return res.status(200).json({
      success: true,
      status: 'AUTHENTICATED',
      message: 'OTP verified successfully. Welcome to Antigravity.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[ANTIGRAVITY // OTP VERIFICATION ERROR]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 4. Resend OTP
 * Re-dispatches a new code with 60-second cooldown protection.
 */
export const resendOTP = async (req, res) => {
  try {
    const { preAuthToken: bodyToken } = req.body;
    const authHeader = req.headers.authorization;
    const preAuthToken =
      authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : bodyToken;

    if (!preAuthToken) {
      return res.status(401).json({
        success: false,
        message: 'Missing verification session token. Please initiate login again.',
      });
    }

    const decoded = verifyPreAuthToken(preAuthToken);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Verification session has expired. Please initiate login again.',
      });
    }

    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Check 60-second rate-limiting cooldown
    if (user.otp?.lastSentAt) {
      const elapsedSeconds = Math.floor((Date.now() - new Date(user.otp.lastSentAt).getTime()) / 1000);
      if (elapsedSeconds < 60) {
        return res.status(429).json({
          success: false,
          message: `Please wait ${60 - elapsedSeconds} second(s) before requesting another code.`,
          retryAfter: 60 - elapsedSeconds,
        });
      }
    }

    // Generate new OTP
    const rawOtp = generateSecureOTP();
    user.setOTP(rawOtp, 5);
    await user.save();

    await sendOTPEmail(user.email, rawOtp);

    res.status(200).json({
      success: true,
      message: 'A fresh verification code has been dispatched.',
      expiresInSeconds: 300,
      devOtp: rawOtp,
    });
  } catch (error) {
    console.error('[ANTIGRAVITY // RESEND OTP ERROR]', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

/**
 * 5. General Authenticate Endpoint
 * Validates active session via Bearer token or processes credential verification.
 * Strictly guarantees JSON responses in every scenario (success & failure).
 */
export const authenticate = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = verifyAccessToken(token);
        if (decoded) {
          const user = await User.findById(decoded.id || decoded.sub);
          if (user) {
            return res.status(200).json({
              success: true,
              status: 'AUTHENTICATED',
              message: 'Token verified successfully.',
              user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
              },
            });
          }
        }
      } catch (tokenErr) {
        return res.status(401).json({
          success: false,
          message: 'Session expired or invalid token. Please sign in again.',
        });
      }
    }

    // If body contains login credentials, route directly through login handler
    if (req.body && (req.body.identifier || req.body.email) && req.body.password) {
      return login(req, res);
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please provide credentials or a valid token.',
    });
  } catch (error) {
    console.error('[ANTIGRAVITY // AUTHENTICATE ERROR]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

