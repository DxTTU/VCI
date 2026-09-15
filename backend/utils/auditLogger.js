import AuditLog from '../models/AuditLog.js';

/**
 * Extracts client network and environment details from Express request
 * @param {import('express').Request} req
 * @returns {string} Clinical IP & Browser fingerprint
 */
export const extractClientRemarks = (req, extraRemarks = '') => {
  if (!req) return extraRemarks || 'Direct Internal System Event';
  
  const rawIp =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    req.ip ||
    '127.0.0.1';
  const ip = rawIp.replace(/^::ffff:/, '');
  
  const userAgent = req.headers['user-agent'] || 'Unknown Client';
  const shortAgent = userAgent.length > 80 ? `${userAgent.slice(0, 77)}...` : userAgent;

  if (extraRemarks) {
    return `${extraRemarks} | IP: ${ip} | UA: ${shortAgent}`;
  }
  return `IP: ${ip} | UA: ${shortAgent}`;
};

/**
 * Creates and records an audit log entry in MongoDB
 * Guaranteed not to throw or interrupt the calling execution pipeline
 * @param {Object} data
 * @param {string} data.module - e.g. 'AUTH', 'MEMBERS', 'CLUBS', 'SYSTEM'
 * @param {string} data.action - e.g. 'LOGIN', 'LOGIN_FAILED', 'OTP_SENT', 'ROLE_UPDATED'
 * @param {string} [data.reference] - e.g. memberId, userId, entity ID
 * @param {string} data.user - User email, username, or identifier
 * @param {string} [data.role] - User role ('superadmin', 'admin', 'member', 'system')
 * @param {('Success'|'Failed')} data.status - 'Success' or 'Failed'
 * @param {string} [data.remarks] - Client IP/browser or operation detail
 * @param {Date} [data.timestamp] - Defaults to new Date()
 * @param {import('express').Request} [data.req] - Express request for automatic IP/UA resolution
 * @returns {Promise<AuditLog|null>}
 */
export const createAuditLog = async (data = {}) => {
  try {
    const {
      module = 'SYSTEM',
      action = 'UNKNOWN_EVENT',
      reference = 'N/A',
      user = 'SYSTEM',
      role = 'system',
      status = 'Success',
      remarks = '',
      timestamp = new Date(),
      req = null,
    } = data;

    // Clinical status normalization
    const normalizedStatus =
      String(status).toLowerCase() === 'failed' ? 'Failed' : 'Success';

    const finalRemarks = req
      ? extractClientRemarks(req, remarks)
      : remarks || 'Standard system execution';

    const logEntry = await AuditLog.create({
      timestamp,
      module: String(module).toUpperCase(),
      action: String(action).toUpperCase(),
      reference: String(reference),
      user: String(user),
      role: String(role).toLowerCase(),
      status: normalizedStatus,
      remarks: finalRemarks,
    });

    return logEntry;
  } catch (error) {
    console.error('[AUDIT LOGGER // DISPATCH ERROR]', error.message);
    return null;
  }
};

export default createAuditLog;
