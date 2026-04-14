const express = require('express');
const Caregiver = require('../models/Caregiver');
const { auth } = require('../middleware/auth');
const router = express.Router();

// GET /api/caregivers
// List registered caregivers - filterable by careType and availability
// Only returns caregivers whose user account actually exists (registered on the site)
router.get('/', async (req, res) => {
  try {
    const { careType, available } = req.query;
    let query = {};
    if (careType) query.specializations = careType;
    if (available !== undefined) query.isAvailable = available === 'true';

    const caregivers = await Caregiver.find(query)
      .populate('user', 'name email phone address createdAt')
      .sort({ rating: -1 });

    // Only return caregivers whose user account is populated (i.e. actually registered)
    const valid = caregivers.filter(c => !!c.user);
    res.json(valid);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/caregivers/me
router.get('/me', auth, async (req, res) => {
  try {
    const caregiver = await Caregiver.findOne({ user: req.user._id })
      .populate('user', 'name email phone address');
    if (!caregiver) return res.status(404).json({ message: 'Caregiver profile not found' });
    res.json(caregiver);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/caregivers/:id
router.get('/:id', async (req, res) => {
  try {
    const caregiver = await Caregiver.findById(req.params.id)
      .populate('user', 'name email phone address');
    if (!caregiver) return res.status(404).json({ message: 'Caregiver not found' });
    res.json(caregiver);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/caregivers/me
router.patch('/me', auth, async (req, res) => {
  try {
    const caregiver = await Caregiver.findOneAndUpdate(
      { user: req.user._id },
      req.body,
      { new: true }
    ).populate('user', 'name email phone');
    if (!caregiver) return res.status(404).json({ message: 'Caregiver profile not found' });
    res.json(caregiver);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
