import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

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
 * Dispatch OTP via email or notification channel
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

  const user = (process.env.EMAIL_USER || '').trim();
  const pass = (process.env.EMAIL_PASS || '').trim().replace(/\s+/g, '');

  if (user && pass && !user.includes('your_email')) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user, pass },
      });

      await transporter.sendMail({
        from: `"VASAVI Club International" <${user}>`,
        to: email,
        subject: 'VASAVI Club Security // Your Verification Code',
        text: `Your single-use sign-in verification code is: ${otp}. It expires in 5 minutes.`,
      });
      console.log(`[SMTP // LOGIN CODE] Dispatched to ${email}`);
    } catch (err) {
      console.warn(`[SMTP // LOGIN WARN] Could not send email: ${err.message}`);
    }
  }

  return true;
};

