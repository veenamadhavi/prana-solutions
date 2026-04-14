const mongoose = require('mongoose');

const caregiverSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specializations: [{
    type: String,
    enum: ['elderly', 'maternity', 'childcare', 'medical', 'postnatal']
  }],
  experience: { type: Number, default: 0 },
  qualifications: [{ type: String }],
  isVerified: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  location: { type: String },
  bio: { type: String },
  assignedPatients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
  schedule: [{
    date: Date,
    timeSlot: String,
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Caregiver', caregiverSchema);
