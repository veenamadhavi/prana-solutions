const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/prana-solutions';

// Inline schemas for seeding
const User = require('./models/User');
const Caregiver = require('./models/Caregiver');
const Booking = require('./models/Booking');

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing
  await User.deleteMany({});
  await Caregiver.deleteMany({});
  await Booking.deleteMany({});
  console.log('Cleared existing data');

  // Create users
  const userPass = await bcrypt.hash('demo123', 12);

  const user1 = await User.create({ name: 'Suresh Kumar', email: 'user@demo.com', password: userPass, role: 'user', phone: '+91 98765 43210' });
  const user2 = await User.create({ name: 'Anitha Reddy', email: 'user2@demo.com', password: userPass, role: 'user', phone: '+91 87654 32109' });
  const cgUser1 = await User.create({ name: 'Dr. Priya Sharma', email: 'caregiver@demo.com', password: userPass, role: 'caregiver', phone: '+91 76543 21098' });
  const cgUser2 = await User.create({ name: 'Nurse Kavitha', email: 'caregiver2@demo.com', password: userPass, role: 'caregiver', phone: '+91 65432 10987' });
  const adminUser = await User.create({ name: 'Admin', email: 'admin@demo.com', password: userPass, role: 'admin' });

  // Create caregiver profiles
  const cg1 = await Caregiver.create({
    user: cgUser1._id, specializations: ['elderly', 'medical'], experience: 5,
    isVerified: true, isAvailable: true, rating: 4.8, totalReviews: 24,
    location: 'Hyderabad', bio: 'Experienced nurse specialising in elderly and post-surgical care.'
  });
  const cg2 = await Caregiver.create({
    user: cgUser2._id, specializations: ['maternity', 'childcare', 'postnatal'], experience: 3,
    isVerified: true, isAvailable: true, rating: 4.9, totalReviews: 18,
    location: 'Kadapa', bio: 'Certified maternity and childcare specialist with passion for family wellness.'
  });

  // Create bookings
  await Booking.create({
    user: user1._id, caregiver: cg1._id, careType: 'elderly',
    patient: { name: 'Rama Lakshaama', age: 72, gender: 'female', medicalConditions: 'Diabetes, Hypertension' },
    careRequirements: ['daily_assistance', 'medical_support'],
    schedule: { startDate: new Date(), timeSlot: 'Morning (6AM–12PM)', duration: '8 hours/day' },
    location: { address: '12, MG Road, Banjara Hills', city: 'Hyderabad', pincode: '500034' },
    additionalNotes: 'Needs insulin monitoring twice daily.',
    status: 'active',
    healthUpdates: [{ message: 'Patient is doing well. BP normal at 120/80. Had breakfast and morning walk completed.', updatedBy: cgUser1._id, timestamp: new Date() }]
  });

  await Booking.create({
    user: user2._id, caregiver: cg2._id, careType: 'maternity',
    patient: { name: 'Anitha Reddy', age: 28, gender: 'female', medicalConditions: 'First pregnancy, 34 weeks' },
    careRequirements: ['postnatal_care', 'daily_assistance'],
    schedule: { startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), timeSlot: 'Full Day (24hr)', duration: 'Full-time (24hr)' },
    location: { address: '45, RK Valley Campus', city: 'Kadapa', pincode: '516002' },
    status: 'assigned'
  });

  await Booking.create({
    user: user1._id, careType: 'childcare',
    patient: { name: 'Arjun Kumar', age: 4, gender: 'male', medicalConditions: '' },
    careRequirements: ['childcare'],
    schedule: { startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), timeSlot: 'Morning (6AM–12PM)', duration: '4 hours/day' },
    location: { address: '12, MG Road', city: 'Hyderabad', pincode: '500034' },
    status: 'completed'
  });

  console.log('\n✅ Seed data created successfully!\n');
  console.log('Demo Credentials:');
  console.log('  User:      user@demo.com     / demo123');
  console.log('  Caregiver: caregiver@demo.com / demo123');
  console.log('  Admin:     admin@demo.com     / demo123\n');

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
