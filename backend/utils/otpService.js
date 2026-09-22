import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';

const JWT_SECRET = process.env.JWT_SECRET || 'antigravity-super-secure-jwt-secret-key-2026';
const PRE_AUTH_SECRET = process.env.PRE_AUTH_SECRET || 'antigravity-preauth-otp-secret-key-2026';

/**
 * Generate a cryptographically secure 6-digit numerical OTP
 */
export const generateSecureOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Hash an OTP using SHA-256 for secure database storage.
 * Plaintext OTPs should NEVER be stored in the database.
 */
export const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp.trim()).digest('hex');
};

/**
 * Issue a temporary Pre-Auth Token to pause the login process
 * until the OTP is verified. Valid for 10 minutes.
 */
export const signPreAuthToken = (userId, email) => {
  return jwt.sign(
    {
      sub: userId,
      email,
      purpose: 'LOGIN_OTP_VERIFICATION',
    },
    PRE_AUTH_SECRET,
    { expiresIn: '10m' }
  );
};

/**
 * Verify the temporary Pre-Auth Token
 */
export const verifyPreAuthToken = (token) => {
  try {
    const decoded = jwt.verify(token, PRE_AUTH_SECRET);
    if (decoded.purpose !== 'LOGIN_OTP_VERIFICATION') {
      throw new Error('Invalid token purpose');
    }
    return decoded;
  } catch (err) {
    return null;
  }
};

/**
 * Issue the final full-access JWT session token once OTP is confirmed
 */
export const signAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role || 'member',
      project: 'Antigravity',
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Verify production access token
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

/**
 * Clinical "The Ordinary" HTML Email Template for Login OTP
 */
const buildClinicalLoginEmailHtml = (email, otp) => `
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
    A sign-in verification challenge has been issued for <strong>${email}</strong>. Use the single-use cryptographic verification code below to authorize your session:
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
 * Dispatch OTP via Resend SDK
 * In development / testing, logs clinical dispatch payload to terminal.
 */
export const sendOTPEmail = async (email, otp) => {
  console.log(`\n=======================================================`);
  console.log(` [ANTIGRAVITY // OTP DISPATCH NOTIFICATION]`);
  console.log(` RECIPIENT: ${email}`);
  console.log(` CODE:      >>> ${otp} <<<`);
  console.log(` VALIDITY:  5 Minutes`);
  console.log(` TIMESTAMP: ${new Date().toISOString()}`);
  console.log(`=======================================================\n`);

  const apiKey = (process.env.RESEND_API_KEY || '').trim();

  if (apiKey) {
    try {
      const resend = new Resend(apiKey);
      const { data, error } = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: `[ VCI PORTAL // IDENTITY CHALLENGE ] Verification Code: ${otp}`,
        text: `[ VCI PORTAL // IDENTITY CHALLENGE ]\n\nYour 6-digit verification code: ${otp}\n\nValid for 5 minutes. Single-use only.`,
        html: buildClinicalLoginEmailHtml(email, otp),
      });

      if (error) {
        console.warn(`[RESEND // LOGIN WARN] Could not send email: ${error.message}`);
      } else {
        console.log(`[RESEND // LOGIN DISPATCH SUCCESS] Dispatched to ${email}, id: ${data?.id}`);
      }
    } catch (err) {
      console.warn(`[RESEND // LOGIN WARN] Exception sending email: ${err.message}`);
    }
  }

  return true;
};

