import express from 'express';
import mongoose from 'mongoose';
import Member from '../models/Member.js';
import Club from '../models/Club.js';
import User from '../models/User.js';
import { requireAuth, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all members with club population
router.get('/', async (req, res) => {
  try {
    const { clubId, status, search } = req.query;
    const query = {};

    if (clubId) query.club = clubId;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { memberId: { $regex: search, $options: 'i' } },
      ];
    }

    const members = await Member.find(query)
      .populate('club', 'clubName clubNumber district')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: members.length, data: members });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single member
router.get('/:id', async (req, res) => {
  try {
    const member = await Member.findById(req.params.id).populate('club');
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member dossier not found' });
    }
    res.json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST onboard/register new member (handles Onboarding Form submissions)
router.post('/onboard', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      bloodGroup,
      occupation,
      email,
      phone,
      address,
      city,
      state,
      postalCode,
      country,
      clubId,
      membershipType,
      role,
      sponsorMemberId,
      sponsorName,
    } = req.body;

    // Validate or auto-resolve active club
    let club = null;
    if (clubId && mongoose.Types.ObjectId.isValid(clubId)) {
      club = await Club.findById(clubId);
    }
    if (!club) {
      club = await Club.findOne({ status: 'Active' }) || await Club.findOne({});
    }
    if (!club) {
      club = await Club.create({
        clubNumber: 'VC-324A-01',
        clubName: 'Vasavi Club of Metropolitan Central',
        district: 'District V-324',
        status: 'Active',
      });
    }

    // Auto-generate clinical Member ID if not provided: e.g. V-938210
    const randomSeq = Math.floor(100000 + Math.random() * 900000);
    const memberId = req.body.memberId || `V-${randomSeq}`;

    // Create Member Record
    const newMember = await Member.create({
      memberId,
      firstName,
      lastName,
      dateOfBirth,
      gender: gender || 'Prefer Not to Disclose',
      bloodGroup,
      occupation,
      email,
      phone,
      address,
      city,
      state: state || 'Tamil Nadu',
      postalCode,
      country: country || 'India',
      club: club._id,
      membershipType: membershipType || 'Regular',
      role: role === 'admin' ? 'admin' : 'member',
      designation: role || 'Vasavi Member',
      sponsorMemberId,
      sponsorName,
      status: 'Active',
      joinDate: new Date(),
    });

    // Update club member count
    await Club.findByIdAndUpdate(club._id, { $inc: { totalMembers: 1 } });

    // Also provision User account for portal access
    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (!existingUser) {
      await User.create({
        name: `${firstName} ${lastName}`.trim(),
        email: cleanEmail,
        password: req.body.password || 'password123',
        role: role === 'admin' ? 'admin' : 'member',
      });
    }

    const populatedMember = await Member.findById(newMember._id).populate(
      'club',
      'clubName clubNumber district'
    );

    res.status(201).json({
      success: true,
      message: 'Member induction dossier registered successfully',
      data: populatedMember,
    });
  } catch (error) {
    console.error('Member onboarding error:', error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A member with this email or ID already exists in the registry.',
      });
    }
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * @route   DELETE /api/members/:id
 * @desc    Removes a member from the database (Admin only)
 */
router.delete('/:id', requireAuth, isAdmin, async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member dossier not located in registry.',
      });
    }

    // Decrement club member count if club exists
    if (member.club) {
      await Club.findByIdAndUpdate(member.club, { $inc: { totalMembers: -1 } });
    }

    // Remove member document
    await Member.findByIdAndDelete(req.params.id);

    // Synchronize: remove linked User account if present
    if (member.email) {
      await User.findOneAndDelete({ email: member.email.toLowerCase().trim() });
    }

    res.json({
      success: true,
      message: `Member dossier [${member.memberId}] successfully removed from registry.`,
    });
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PATCH /api/members/:id/role
 * @desc    Updates a specific member's role (e.g. promoting to 'admin') (Admin only)
 */
router.patch('/:id/role', requireAuth, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !['member', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role specified. Role must be either 'member' or 'admin'.",
      });
    }

    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member dossier not located in registry.',
      });
    }

    member.role = role;
    await member.save();

    // Synchronize associated User account role if present
    if (member.email) {
      await User.findOneAndUpdate(
        { email: member.email.toLowerCase().trim() },
        { role: role }
      );
    }

    const populatedMember = await Member.findById(member._id).populate(
      'club',
      'clubName clubNumber district'
    );

    res.json({
      success: true,
      message: `Member [${member.memberId}] role successfully updated to '${role}'.`,
      data: populatedMember,
    });
  } catch (error) {
    console.error('Update member role error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
