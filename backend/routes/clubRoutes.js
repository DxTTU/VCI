import express from 'express';
import Club from '../models/Club.js';

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

// POST create club
router.post('/', async (req, res) => {
  try {
    const club = await Club.create(req.body);
    res.status(201).json({ success: true, data: club });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
