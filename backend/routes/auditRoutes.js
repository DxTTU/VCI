import express from 'express';
import AuditLog from '../models/AuditLog.js';
import { requireAuth, isAdmin } from '../middleware/authMiddleware.js';
import { createAuditLog } from '../utils/auditLogger.js';

const router = express.Router();

/**
 * @route   GET /api/audit-logs
 * @desc    Fetch immutable audit trail records sorted by timestamp descending
 * @access  Protected (Admin and Super Admin only)
 */
router.get('/', requireAuth, isAdmin, async (req, res) => {
  try {
    const { module, status, search, limit = 100, page = 1 } = req.query;
    const query = {};

    if (module && module !== 'ALL') {
      query.module = module.toUpperCase();
    }

    if (status && status !== 'ALL') {
      query.status = status === 'Failed' ? 'Failed' : 'Success';
    }

    if (search) {
      query.$or = [
        { user: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } },
        { remarks: { $regex: search, $options: 'i' } },
      ];
    }

    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 500);
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (parsedPage - 1) * parsedLimit;

    const [total, logs] = await Promise.all([
      AuditLog.countDocuments(query),
      AuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .lean(),
    ]);

    res.json({
      success: true,
      count: logs.length,
      total,
      page: parsedPage,
      totalPages: Math.ceil(total / parsedLimit) || 1,
      data: logs,
    });
  } catch (error) {
    console.error('[AUDIT LOGS // GET ERROR]', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/audit-logs
 * @desc    Endpoint to record client-side telemetry events (e.g. LOGOUT, VIEW_ACCESSED)
 * @access  Protected
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { module = 'SYSTEM', action = 'CLIENT_EVENT', reference = 'CLIENT', remarks = '' } = req.body;
    
    const user = req.user;
    const log = await createAuditLog({
      module,
      action,
      reference,
      user: user?.email || 'AUTHENTICATED_USER',
      role: user?.role || 'member',
      status: 'Success',
      remarks,
      req,
    });

    res.status(201).json({ success: true, data: log });
  } catch (error) {
    console.error('[AUDIT LOGS // POST ERROR]', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
