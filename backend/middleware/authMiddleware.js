import { verifyAccessToken } from '../utils/otpService.js';
import User from '../models/User.js';

/**
 * Authentication Guard Middleware for Protected Routes
 */
export const requireAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = verifyAccessToken(token);

      const user = await User.findById(decoded.id).select('-otp');
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User belonging to this token no longer exists or is inactive.',
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token. Please log in again.',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authorization token provided.',
    });
  }
};

/**
 * Role-Based Access Guard Middleware (Admin Only)
 * Verifies JWT token and checks if the decoded user's role is strictly admin.
 */
export const isAdmin = async (req, res, next) => {
  try {
    let user = req.user;

    if (!user) {
      let token;
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
      ) {
        token = req.headers.authorization.split(' ')[1];
      }

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. No authorization token provided.',
        });
      }

      const decoded = verifyAccessToken(token);
      user = await User.findById(decoded.id).select('-otp');
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User belonging to this token no longer exists or is inactive.',
        });
      }
      req.user = user;
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Administrator privileges required for this operation.',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authorization token.',
    });
  }
};

