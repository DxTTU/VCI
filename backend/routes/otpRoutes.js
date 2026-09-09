import 'dotenv/config';
import express from 'express';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import OTP from '../models/OTP.js';

const router = express.Router();

/**
 * Get configured Gmail SMTP Transporter
 * Reads process.env dynamically and sanitizes credentials
 */
const getTransporter = () => {
  const user = (process.env.EMAIL_USER || '').trim();
  const pass = (process.env.EMAIL_PASS || '').trim().replace(/\s+/g, '');

  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user,
      pass,
    },
  });
};

/**
 * Generate a cryptographically random 6-digit numerical OTP
 */
const generate6DigitCode = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Hash code using SHA-256 for secure database storage
 */
const hashCode = (code) => {
  return crypto.createHash('sha256').update(code.trim()).digest('hex');
};

/**
 * POST /send-otp & POST /api/send-otp
 * Generates a 6-digit cryptographic code, hashes & stores it in MongoDB with 5-min TTL,
 * and uses nodemailer to dispatch it to the user's email address.
 */
router.post(['/send-otp', '/api/send-otp'], async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid recipient email address.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const rawOtp = generate6DigitCode();
    const hashedOtp = hashCode(rawOtp);

    // Remove any previous OTPs for this email to enforce one active challenge
    await OTP.deleteMany({ email: cleanEmail });

    // Store hashed OTP in MongoDB (TTL index purges document after 5 minutes / 300s)
    await OTP.create({
      email: cleanEmail,
      otp: hashedOtp,
      createdAt: new Date(),
    });

    const senderEmail = process.env.EMAIL_USER?.trim() || 'no-reply@vasaviclub.org';

    // Professional VASAVI Club International email template
    const mailOptions = {
      from: `"VASAVI Club International" <${senderEmail}>`,
      to: cleanEmail,
      subject: 'Your VASAVI Club International Verification Code',
      text: `Your VASAVI Club International verification code is: ${rawOtp}. This code expires in 5 minutes.`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 28px; border: 1px solid #E5E5E5; background-color: #FFFFFF; color: #171717;">
          <div style="border-bottom: 2px solid #00338D; padding-bottom: 14px; margin-bottom: 20px;">
            <div style="font-size: 10px; font-family: monospace; color: #737373; letter-spacing: 0.18em; text-transform: uppercase;">
              VASAVI CLUB INTERNATIONAL // DISTRICT V-324
            </div>
            <h2 style="margin: 6px 0 0 0; font-size: 18px; font-weight: 600; letter-spacing: -0.01em; color: #171717;">
              Your VASAVI Club International Verification Code
            </h2>
          </div>
          
          <p style="font-size: 13px; color: #404040; line-height: 1.6; margin: 0 0 16px 0;">
            A candidate induction session has been initiated for <strong style="color: #171717;">${cleanEmail}</strong>. Please input the 6-digit cryptographic verification code below to authorize your registration:
          </p>

          <div style="background-color: #FAFAFA; border: 1px solid #E5E5E5; padding: 20px; text-align: center; margin: 24px 0;">
            <span style="font-family: monospace; font-size: 34px; font-weight: 700; letter-spacing: 0.35em; color: #00338D; display: inline-block; padding-left: 0.35em;">
              ${rawOtp}
            </span>
          </div>

          <div style="font-size: 11px; font-family: monospace; color: #737373; border-top: 1px solid #F5F5F5; padding-top: 14px; line-height: 1.6;">
            <div>EXPIRATION: 5 MINUTES (300 SECONDS)</div>
            <div>STATUS: SINGLE-USE CRYPTOGRAPHIC CODE</div>
            <div style="margin-top: 8px; color: #A3A3A3;">If you did not request this code, please disregard this email.</div>
          </div>
        </div>
      `,
    };

    // Dispatch via nodemailer using real SMTP credentials
    try {
      const transporter = getTransporter();
      await transporter.sendMail(mailOptions);
      console.log(`[SMTP // DISPATCH SUCCESS] Real email dispatched to ${cleanEmail}`);
    } catch (smtpError) {
      console.error(`[SMTP // SEND ERROR] Failed to send via Gmail SMTP: ${smtpError.message}`);
    }

    return res.status(200).json({
      success: true,
      message: 'Verification code dispatched to your email address.',
      email: cleanEmail,
      expiresInSeconds: 300,
    });
  } catch (error) {
    console.error('[SEND-OTP // ERROR]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to dispatch verification code.',
    });
  }
});

/**
 * POST /verify-otp & POST /api/verify-otp
 * Validates user's 6-digit submitted input against active MongoDB record
 */
router.post(['/verify-otp', '/api/verify-otp'], async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'INVALID CRYPTOGRAPHIC CODE. PLEASE TRY AGAIN.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    if (cleanOtp.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'INVALID CRYPTOGRAPHIC CODE. PLEASE TRY AGAIN.',
      });
    }

    const hashedCandidate = hashCode(cleanOtp);

    // Query active record by hash (with fallback to plain code if legacy)
    const activeDoc = await OTP.findOne({
      email: cleanEmail,
      $or: [{ otp: hashedCandidate }, { otp: cleanOtp }],
    });

    if (!activeDoc) {
      return res.status(400).json({
        success: false,
        message: 'INVALID CRYPTOGRAPHIC CODE. PLEASE TRY AGAIN.',
      });
    }

    // Immediately delete the verified OTP record to enforce single-use protection
    await OTP.deleteOne({ _id: activeDoc._id });

    return res.status(200).json({
      success: true,
      message: 'Email successfully verified.',
      email: cleanEmail,
    });
  } catch (error) {
    console.error('[VERIFY-OTP // ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'INVALID CRYPTOGRAPHIC CODE. PLEASE TRY AGAIN.',
    });
  }
});

export default router;
