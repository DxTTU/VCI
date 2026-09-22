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
<div style="font-family: 'Courier New', Courier, monospace; max-width: 500px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 40px; background-color: #ffffff; color: #111827;">
  <p style="font-size: 12px; font-weight: bold; color: #6b7280; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 30px;">
    [ VCI PORTAL // IDENTITY CHALLENGE ]
  </p>
  
  <p style="font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
    A verification request was initiated for your portal account (${email}). Provide the following cryptographic sequence to authorize entry.
  </p>
  
  <div style="margin: 40px 0; padding: 20px; border: 1px solid #e5e7eb; text-align: center;">
    <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #00338D; display: inline-block; padding-left: 8px;">
      ${otp}
    </span>
  </div>
  
  <p style="font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; line-height: 1.6;">
    TTL DURATION: 5 MINUTES<br/>
    IF UNAUTHORIZED, DISREGARD.
  </p>
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
        subject: 'VCI PORTAL // IDENTITY CHALLENGE',
        text: `[ VCI PORTAL // IDENTITY CHALLENGE ]\n\nA verification request was initiated for your portal account.\n\nYour 6-digit verification code: ${rawOtp}\n\nTTL DURATION: 5 MINUTES\nIF UNAUTHORIZED, DISREGARD.`,
        html: buildClinicalEmailHtml(cleanEmail, rawOtp),
      });

      if (error) {
        console.error('Resend API Error:', error);
        await OTP.deleteMany({ email: cleanEmail });
        return res.status(400).json({
          success: false,
          message: error.message || 'Failed to dispatch email challenge.',
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
        message: 'OTP challenge dispatched successfully.',
        email: cleanEmail,
        id: data?.id,
        expiresInSeconds: 300,
      });
    } catch (dispatchError) {
      console.error('Server Error:', dispatchError);
      await OTP.deleteMany({ email: cleanEmail });
      return res.status(500).json({
        success: false,
        message: dispatchError.message || 'Internal server anomaly.',
      });
    }
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server anomaly.',
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
