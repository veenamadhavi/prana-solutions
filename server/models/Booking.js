const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  caregiver: { type: mongoose.Schema.Types.ObjectId, ref: 'Caregiver' },
  careType: {
    type: String,
    enum: ['elderly', 'maternity', 'childcare'],
    required: true
  },
  patient: {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    medicalConditions: { type: String, default: '' }
  },
  careRequirements: [{
    type: String,
    enum: ['daily_assistance', 'medical_support', 'childcare', 'postnatal_care']
  }],
  schedule: {
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    timeSlot: { type: String, required: true },
    duration: { type: String, required: true }
  },
  location: {
    address: { type: String, required: true },
    city: { type: String },
    pincode: { type: String }
  },
  additionalNotes: { type: String, default: '' },

  // Status flow:
  // pending_acceptance -> user selected a caregiver, waiting for caregiver accept/reject
  // accepted           -> caregiver accepted, care not yet started
  // active             -> care is ongoing
  // completed          -> care finished
  // cancelled          -> cancelled by user
  // rejected           -> caregiver rejected the request
  status: {
    type: String,
    enum: ['pending_acceptance', 'accepted', 'active', 'completed', 'cancelled', 'rejected'],
    default: 'pending_acceptance'
  },

  rejectionReason: { type: String, default: '' },

  healthUpdates: [{
    message: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }],

  totalAmount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
