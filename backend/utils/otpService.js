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
        subject: 'VCI PORTAL // IDENTITY CHALLENGE',
        text: `[ VCI PORTAL // IDENTITY CHALLENGE ]\n\nA verification request was initiated for your portal account.\n\nYour 6-digit verification code: ${otp}\n\nTTL DURATION: 5 MINUTES\nIF UNAUTHORIZED, DISREGARD.`,
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

