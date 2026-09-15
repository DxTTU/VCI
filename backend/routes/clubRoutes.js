import express from 'express';
import Club from '../models/Club.js';
import { requireAuth, isSuperAdmin } from '../middleware/authMiddleware.js';
import createAuditLog from '../utils/auditLogger.js';

const router = express.Router();

// GET all clubs
router.get('/', async (req, res) => {
  try {
    const clubs = await Club.find().sort({ clubName: 1 });
    res.json({ success: true, count: clubs.length, data: clubs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET club by ID or Number
router.get('/:id', async (req, res) => {
  try {
    const club = await Club.findOne({
      $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { clubNumber: req.params.id }],
    });
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club registry entry not found' });
    }
    res.json({ success: true, data: club });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/clubs
 * @desc    Creates a new chartered club entity in District V-324
 * @access  Strictly Super Admin Only
 */
router.post('/', requireAuth, isSuperAdmin, async (req, res) => {
  try {
    const { clubName, clubId, charterDate, location, email, meetingSchedule } = req.body;

    if (!clubName || !clubId || !charterDate || !email) {
      return res.status(400).json({
        success: false,
        message: 'Club Name, Club ID, Charter Date, and Email are mandatory fields.',
      });
    }

    const cleanClubId = String(clubId).trim().toUpperCase();
    const cleanEmail = String(email).toLowerCase().trim();

    // Verify uniqueness of clubNumber
    const existingClub = await Club.findOne({ clubNumber: cleanClubId });
    if (existingClub) {
      return res.status(409).json({
        success: false,
        message: `A chartered club with ID [${cleanClubId}] already exists in the registry.`,
      });
    }

    // Structure meeting schedule
    const scheduleFrequency = typeof meetingSchedule === 'string' && meetingSchedule.trim()
      ? meetingSchedule.trim()
      : 'Bi-Weekly';

    const scheduleVenue = location?.trim() || 'Vasavi Cultural Hall';

    const newClub = await Club.create({
      clubNumber: cleanClubId,
      clubName: clubName.trim(),
      district: req.body.district || 'District V-324',
      multipleDistrict: req.body.multipleDistrict || 'VCI 324',
      region: req.body.region || 'Region II',
      zone: req.body.zone || 'Zone 1',
      charterDate: new Date(charterDate),
      status: 'Active',
      location: location?.trim() || '',
      meetingSchedule: {
        frequency: scheduleFrequency,
        venue: scheduleVenue,
        day: req.body.meetingDay || 'Saturday',
        time: req.body.meetingTime || '19:00 IST',
        address: location?.trim() || '',
      },
      contactEmail: cleanEmail,
      contactPhone: req.body.contactPhone || req.body.phone || '+91 44 2851 4090',
      website: req.body.website || '',
      totalMembers: 0,
    });

    // Immutable audit telemetry entry
    await createAuditLog({
      module: 'CLUBS',
      action: 'CLUB_CREATED',
      reference: newClub.clubNumber,
      user: req.user?.email || 'SUPERADMIN',
      role: req.user?.role || 'superadmin',
      status: 'Success',
      remarks: `Super Admin created charter entity: ${newClub.clubName} (${newClub.clubNumber}) at ${location || 'District V-324'}`,
      req,
    });

    res.status(201).json({
      success: true,
      message: `Charter entity [${newClub.clubNumber}] successfully inducted into District V-324 registry.`,
      data: newClub,
    });
  } catch (error) {
    console.error('[CLUB CONTROLLER // CREATE ERROR]', error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A club with this Club ID or number already exists in the registry.',
      });
    }
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * @route   DELETE /api/clubs/:id
 * @desc    Disbands and permanently purges a chartered club entity from District V-324 registry
 * @access  Strictly Super Admin Only
 */
router.delete('/:id', requireAuth, isSuperAdmin, async (req, res) => {
  try {
    const targetIdentifier = req.params.id;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(targetIdentifier);

    const club = await Club.findOne({
      $or: [
        { _id: isObjectId ? targetIdentifier : null },
        { clubNumber: targetIdentifier },
      ],
    });

    if (!club) {
      return res.status(404).json({
        success: false,
        message: `Charter entity [${targetIdentifier}] not found in registry.`,
      });
    }

    const clubDetails = {
      _id: club._id,
      clubNumber: club.clubNumber,
      clubName: club.clubName,
      district: club.district,
    };

    // Remove document from MongoDB collection
    await Club.findByIdAndDelete(club._id);

    // Record immutable audit telemetry log
    await createAuditLog({
      module: 'CLUBS',
      action: 'CLUB_DELETED',
      reference: club.clubNumber || club._id.toString(),
      user: req.user?.email || 'SUPERADMIN',
      role: req.user?.role || 'superadmin',
      status: 'Success',
      remarks: `Super Admin disbanded/deleted charter entity: ${club.clubName} (${club.clubNumber})`,
      req,
    });

    res.json({
      success: true,
      message: `Charter entity [${club.clubName}] (${club.clubNumber}) successfully disbanded and removed from registry.`,
      data: clubDetails,
    });
  } catch (error) {
    console.error('[CLUB CONTROLLER // DELETE ERROR]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error occurred while disbanding club.',
    });
  }
});

export default router;
