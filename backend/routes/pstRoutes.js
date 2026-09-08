import express from 'express';
import PST from '../models/PST.js';

const router = express.Router();

// GET all PST executive rosters
router.get('/', async (req, res) => {
  try {
    const { lionYear, clubId } = req.query;
    const query = {};
    if (lionYear) query.lionYear = lionYear;
    if (clubId) query.club = clubId;

    const rosters = await PST.find(query)
      .populate('club', 'clubName clubNumber district')
      .populate('president.member', 'firstName lastName email phone memberId')
      .populate('secretary.member', 'firstName lastName email phone memberId')
      .populate('treasurer.member', 'firstName lastName email phone memberId')
      .sort({ lionYear: -1 });

    res.json({ success: true, count: rosters.length, data: rosters });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST register PST roster
router.post('/', async (req, res) => {
  try {
    const pstRecord = await PST.create(req.body);
    res.status(201).json({ success: true, data: pstRecord });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
