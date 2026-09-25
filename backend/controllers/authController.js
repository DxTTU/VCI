import mongoose from 'mongoose';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import {
  generateSecureOTP,
  hashOTP,
  signPreAuthToken,
  verifyPreAuthToken,
  signAccessToken,
  verifyAccessToken,
  sendOTPEmail,
} from '../utils/otpService.js';

import Member from '../models/Member.js';
import createAuditLog from '../utils/auditLogger.js';

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
      await createAuditLog({
        module: 'AUTH',
        action: 'LOGIN_FAILED',
        reference: 'N/A',
        user: loginId || 'UNKNOWN',
        role: 'anonymous',
        status: 'Failed',
        remarks: 'Missing email/password credentials',
        req,
      });
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
      await createAuditLog({
        module: 'AUTH',
        action: 'LOGIN_FAILED',
        reference: loginId,
        user: searchEmail,
        role: 'anonymous',
        status: 'Failed',
        remarks: 'User account not located in registry',
        req,
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    if (!user.isActive) {
      await createAuditLog({
        module: 'AUTH',
        action: 'LOGIN_BLOCKED',
        reference: user._id.toString(),
        user: user.email,
        role: user.role,
        status: 'Failed',
        remarks: 'Account is deactivated',
        req,
      });
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Please contact administrator.',
      });
    }

    // Verify Password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      await createAuditLog({
        module: 'AUTH',
        action: 'LOGIN_FAILED',
        reference: user._id.toString(),
        user: user.email,
        role: user.role,
        status: 'Failed',
        remarks: 'Invalid password credential',
        req,
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    // Generate 6-digit cryptographic OTP and pause login
    const rawOtp = generateSecureOTP();
    user.setOTP(rawOtp, 5); // 5 minutes expiration
    await user.save();

    // Store in MongoDB OTP collection (TTL index purges document after 5 minutes)
    await OTP.deleteMany({ email: user.email.toLowerCase().trim() });
    await OTP.create({
      email: user.email.toLowerCase().trim(),
      otp: hashOTP(rawOtp),
      createdAt: new Date(),
    });

    // Dispatch OTP (Email / Notification)
    await sendOTPEmail(user.email, rawOtp);

    // Audit log OTP challenge
    await createAuditLog({
      module: 'AUTH',
      action: 'OTP_CHALLENGE_ISSUED',
      reference: user._id.toString(),
      user: user.email,
      role: user.role,
      status: 'Success',
      remarks: '6-digit OTP verification code dispatched to email',
      req,
    });

    // Issue short-lived Pre-Auth Token (10 minutes)
    const preAuthToken = signPreAuthToken(user._id.toString(), user.email);

    // Pause login and prompt client for OTP
    return res.status(200).json({
      success: true,
      status: 'OTP_REQUIRED',
      message: 'Credentials authenticated. A 6-digit verification code has been dispatched to your email.',
      preAuthToken,
      email: user.email,
      maskedEmail: maskEmail(user.email),
      expiresInSeconds: 300,
    });
  } catch (error) {
    console.error('[ANTIGRAVITY // LOGIN ERROR]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 3. Verify OTP (Phase 2)
 * Strictly validates user-submitted 6-digit code against the MongoDB OTP collection.
 * Deletes document upon match, issues production session JWT, and returns user payload.
 */
export const verifyOTP = async (req, res) => {
  try {
    const { otp, email, preAuthToken: bodyToken } = req.body;

    const authHeader = req.headers.authorization;
    const preAuthToken =
      authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : bodyToken;

    let targetEmail = (email || '').toLowerCase().trim();

    if (!targetEmail && preAuthToken) {
      const decoded = verifyPreAuthToken(preAuthToken);
      if (decoded?.email) {
        targetEmail = decoded.email.toLowerCase().trim();
      }
    }

    if (!targetEmail || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Code expired or not requested',
      });
    }

    const cleanOtp = otp.toString().trim();

    if (cleanOtp.length !== 6) {
      await createAuditLog({
        module: 'AUTH',
        action: 'OTP_VERIFY_FAILED',
        reference: targetEmail,
        user: targetEmail,
        role: 'user',
        status: 'Failed',
        remarks: 'Invalid OTP length entered',
        req,
      });
      return res.status(400).json({
        success: false,
        message: '[ERR] CRYPTOGRAPHIC SEQUENCE MISMATCH',
      });
    }

    // Database Query: Locate active OTP document in MongoDB collection for target email
    const otpDoc = await OTP.findOne({ email: targetEmail });

    // Validation Logic 1: Check if an OTP document exists for that email
    if (!otpDoc) {
      await createAuditLog({
        module: 'AUTH',
        action: 'OTP_VERIFY_FAILED',
        reference: targetEmail,
        user: targetEmail,
        role: 'user',
        status: 'Failed',
        remarks: 'Code expired or not requested',
        req,
      });
      return res.status(400).json({
        success: false,
        message: 'Code expired or not requested',
      });
    }

    // Validation Logic 2: Compare user-submitted 6-digit code with stored code
    const candidateHash = hashOTP(cleanOtp);
    const isMatch = otpDoc.otp === candidateHash || otpDoc.otp === cleanOtp;

    if (!isMatch) {
      await createAuditLog({
        module: 'AUTH',
        action: 'OTP_VERIFY_FAILED',
        reference: targetEmail,
        user: targetEmail,
        role: 'user',
        status: 'Failed',
        remarks: '[ERR] CRYPTOGRAPHIC SEQUENCE MISMATCH',
        req,
      });
      return res.status(400).json({
        success: false,
        message: '[ERR] CRYPTOGRAPHIC SEQUENCE MISMATCH',
      });
    }

    // Cleanup: Delete the OTP document from the database so it cannot be reused
    await OTP.deleteOne({ _id: otpDoc._id });

    // Fetch user or initialize session user
    let user = await User.findOne({ email: targetEmail });
    if (user) {
      user.clearOTP();
      await user.save();
    } else {
      user = {
        _id: new mongoose.Types.ObjectId(),
        email: targetEmail,
        role: 'member',
        name: targetEmail.split('@')[0],
      };
    }

    // Generate the authentication JWT
    const token = signAccessToken(user);

    await createAuditLog({
      module: 'AUTH',
      action: 'LOGIN',
      reference: user._id.toString(),
      user: targetEmail,
      role: user.role || 'member',
      status: 'Success',
      remarks: 'Strict database OTP verified; full session authenticated',
      req,
    });

    return res.status(200).json({
      success: true,
      status: 'AUTHENTICATED',
      message: 'Cryptographic sequence verified successfully.',
      token,
      user: {
        id: user._id,
        name: user.name || (user.firstName ? `${user.firstName} ${user.lastName}`.trim() : user.email.split('@')[0]),
        email: user.email,
        role: user.role,
        memberId: user.memberId,
        clubName: user.clubName,
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

    // Store in MongoDB OTP collection
    await OTP.deleteMany({ email: user.email.toLowerCase().trim() });
    await OTP.create({
      email: user.email.toLowerCase().trim(),
      otp: hashOTP(rawOtp),
      createdAt: new Date(),
    });

    await sendOTPEmail(user.email, rawOtp);

    res.status(200).json({
      success: true,
      message: 'A fresh verification code has been dispatched.',
      expiresInSeconds: 300,
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

