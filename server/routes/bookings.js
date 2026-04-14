const express = require('express');
const Booking = require('../models/Booking');
const Caregiver = require('../models/Caregiver');
const { auth } = require('../middleware/auth');
const router = express.Router();

// POST /api/bookings
// User creates a booking and explicitly picks a caregiver (required)
router.post('/', auth, async (req, res) => {
  try {
    const { caregiverId, ...rest } = req.body;

    if (!caregiverId) {
      return res.status(400).json({ message: 'Please select a caregiver to send the request to.' });
    }

    // Verify caregiver exists and is available
    const caregiver = await Caregiver.findById(caregiverId).populate('user', 'name email phone');
    if (!caregiver) {
      return res.status(404).json({ message: 'Selected caregiver not found.' });
    }
    if (!caregiver.isAvailable) {
      return res.status(400).json({ message: 'This caregiver is currently unavailable. Please choose another.' });
    }

    const booking = await Booking.create({
      ...rest,
      user: req.user._id,
      caregiver: caregiver._id,
      status: 'pending_acceptance'
    });

    await booking.populate([
      { path: 'user', select: 'name email phone' },
      { path: 'caregiver', populate: { path: 'user', select: 'name email phone' } }
    ]);

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/bookings
// Returns bookings relevant to the current user's role
router.get('/', auth, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'user') {
      query.user = req.user._id;
    } else if (req.user.role === 'caregiver') {
      const cg = await Caregiver.findOne({ user: req.user._id });
      if (!cg) return res.json([]);
      query.caregiver = cg._id;
    }
    // admin sees all (no filter)

    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .populate({ path: 'caregiver', populate: { path: 'user', select: 'name email phone' } })
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/bookings/incoming
// Returns all pending_acceptance requests sent to THIS caregiver
router.get('/incoming', auth, async (req, res) => {
  try {
    if (req.user.role !== 'caregiver') {
      return res.status(403).json({ message: 'Only caregivers can view incoming requests.' });
    }
    const cg = await Caregiver.findOne({ user: req.user._id });
    if (!cg) return res.json([]);

    const requests = await Booking.find({ caregiver: cg._id, status: 'pending_acceptance' })
      .populate('user', 'name email phone')
      .populate({ path: 'caregiver', populate: { path: 'user', select: 'name email phone' } })
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/bookings/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate({ path: 'caregiver', populate: { path: 'user', select: 'name email phone' } });

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/bookings/:id/respond
// Caregiver accepts or rejects a pending_acceptance booking
router.patch('/:id/respond', auth, async (req, res) => {
  try {
    if (req.user.role !== 'caregiver') {
      return res.status(403).json({ message: 'Only caregivers can respond to booking requests.' });
    }

    const { action, rejectionReason } = req.body;
    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Action must be "accept" or "reject".' });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate({ path: 'caregiver', populate: { path: 'user', select: 'name email phone' } });

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== 'pending_acceptance') {
      return res.status(400).json({ message: 'This booking has already been responded to.' });
    }

    // Verify this caregiver owns this booking
    const cg = await Caregiver.findOne({ user: req.user._id });
    if (!cg || booking.caregiver._id.toString() !== cg._id.toString()) {
      return res.status(403).json({ message: 'You are not assigned to this booking.' });
    }

    booking.status = action === 'accept' ? 'accepted' : 'rejected';
    if (action === 'reject' && rejectionReason) {
      booking.rejectionReason = rejectionReason;
    }
    await booking.save();

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/bookings/:id/status
// Caregiver updates status: accepted -> active -> completed
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['active', 'completed', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${allowed.join(', ')}` });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate('user', 'name email phone')
      .populate({ path: 'caregiver', populate: { path: 'user', select: 'name email phone' } });

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/bookings/:id/health-update
router.post('/:id/health-update', auth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Message cannot be empty.' });

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { $push: { healthUpdates: { message, updatedBy: req.user._id } } },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/bookings/:id  (cancel by user)
router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorised to cancel this booking.' });
    }
    booking.status = 'cancelled';
    await booking.save();
    res.json({ message: 'Booking cancelled successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
