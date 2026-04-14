const express = require('express');
const Review = require('../models/Review');
const Caregiver = require('../models/Caregiver');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const review = await Review.create({ ...req.body, user: req.user._id });

    // Update caregiver rating
    const reviews = await Review.find({ caregiver: req.body.caregiver });
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    await Caregiver.findByIdAndUpdate(req.body.caregiver, {
      rating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/caregiver/:id', async (req, res) => {
  try {
    const reviews = await Review.find({ caregiver: req.params.id })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
