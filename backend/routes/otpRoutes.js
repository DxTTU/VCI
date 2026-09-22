import 'dotenv/config';
import express from 'express';
import { Resend } from 'resend';
import crypto from 'crypto';
import OTP from '../models/OTP.js';
import createAuditLog from '../utils/auditLogger.js';

const router = express.Router();

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
 * Clinical "The Ordinary" HTML Email Template
 * Stark white background, 1px border (#e5e7eb), 0px rounded corners,
 * monospace typography, clinical header, spaced-out code, expiration warning.
 */
const buildClinicalEmailHtml = (email, otp) => `
<div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 0px; max-width: 540px; margin: 20px auto; padding: 32px; font-family: 'Courier New', Courier, monospace; color: #111827;">
  <div style="border-bottom: 2px solid #00338D; padding-bottom: 14px; margin-bottom: 24px;">
    <div style="font-size: 14px; font-weight: bold; letter-spacing: 0.12em; color: #00338D; text-transform: uppercase;">
      [ VCI PORTAL // IDENTITY CHALLENGE ]
    </div>
    <div style="font-size: 10px; color: #6b7280; margin-top: 4px; letter-spacing: 0.05em;">
      VASAVI CLUBS INTERNATIONAL // ACCESS VERIFICATION
    </div>
  </div>

  <p style="font-size: 13px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">
    A verification challenge has been generated for <strong>${email}</strong>. Use the single-use cryptographic verification code below to authorize your registration:
  </p>

  <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 0px; padding: 24px; text-align: center; margin: 24px 0;">
    <div style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #00338D; display: inline-block; padding-left: 8px;">
      ${otp}
    </div>
  </div>

  <div style="border-top: 1px solid #e5e7eb; border-radius: 0px; padding-top: 16px; margin-top: 24px; font-size: 11px; line-height: 1.6; color: #6b7280;">
    <div style="color: #b91c1c; font-weight: bold;">
      WARNING: Valid for 5 minutes. Single-use only.
    </div>
    <div style="margin-top: 4px;">
      STATUS: CRYPTOGRAPHIC SINGLE-USE CHALLENGE
    </div>
    <div style="margin-top: 8px; color: #9ca3af;">
      If you did not request this verification code, please disregard this transmission.
    </div>
  </div>
</div>
`;

/**
 * POST /send-otp & POST /api/send-otp
 * Generates a 6-digit cryptographic code, hashes & stores it in MongoDB with 5-min TTL,
 * and uses Resend SDK to dispatch it to the user's email address.
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

    console.log(`[OTP // GENERATED] Code: ${rawOtp} for ${cleanEmail}`);

    // Dispatch via Resend SDK
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { data, error } = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: cleanEmail,
        subject: `[ VCI PORTAL // IDENTITY CHALLENGE ] Verification Code: ${rawOtp}`,
        text: `[ VCI PORTAL // IDENTITY CHALLENGE ]\n\nYour 6-digit verification code: ${rawOtp}\n\nValid for 5 minutes. Single-use only.`,
        html: buildClinicalEmailHtml(cleanEmail, rawOtp),
      });

      if (error) {
        console.error('[RESEND // DISPATCH ERROR]', error);
        await OTP.deleteMany({ email: cleanEmail });
        return res.status(400).json({
          success: false,
          message: error.message || 'Failed to dispatch verification code via Resend.',
          error: error.name || 'ResendApiError',
        });
      }

      console.log(`[RESEND // DISPATCH SUCCESS] Real email dispatched to ${cleanEmail}, id: ${data?.id}`);

      await createAuditLog({
        module: 'AUTH',
        action: 'OTP_SENT',
        reference: cleanEmail,
        user: cleanEmail,
        role: 'candidate',
        status: 'Success',
        remarks: `Candidate induction verification code dispatched via Resend (ID: ${data?.id})`,
        req,
      });

      return res.status(200).json({
        success: true,
        message: 'Verification code dispatched to your email address.',
        email: cleanEmail,
        id: data?.id,
        expiresInSeconds: 300,
      });
    } catch (dispatchError) {
      console.error('[RESEND // DISPATCH EXCEPTION]', dispatchError);
      await OTP.deleteMany({ email: cleanEmail });
      return res.status(500).json({
        success: false,
        message: dispatchError.message || 'Failed to dispatch verification code via Resend.',
      });
    }
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
      await createAuditLog({
        module: 'AUTH',
        action: 'OTP_VERIFY_FAILED',
        reference: cleanEmail,
        user: cleanEmail,
        role: 'candidate',
        status: 'Failed',
        remarks: 'Invalid OTP length entered during induction',
        req,
      });
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
      await createAuditLog({
        module: 'AUTH',
        action: 'OTP_VERIFY_FAILED',
        reference: cleanEmail,
        user: cleanEmail,
        role: 'candidate',
        status: 'Failed',
        remarks: 'Mismatch or expired code entered during induction',
        req,
      });
      return res.status(400).json({
        success: false,
        message: 'INVALID CRYPTOGRAPHIC CODE. PLEASE TRY AGAIN.',
      });
    }

    // Immediately delete the verified OTP record to enforce single-use protection
    await OTP.deleteOne({ _id: activeDoc._id });

    await createAuditLog({
      module: 'AUTH',
      action: 'OTP_VERIFIED',
      reference: cleanEmail,
      user: cleanEmail,
      role: 'candidate',
      status: 'Success',
      remarks: 'Candidate successfully verified email via single-use OTP',
      req,
    });

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
