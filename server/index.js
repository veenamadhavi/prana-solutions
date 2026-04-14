const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// ✅ FIXED CORS (VERY IMPORTANT)
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://prana-solutions-acl7.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// ✅ Middleware
app.use(express.json());

// ✅ Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/caregivers', require('./routes/caregivers'));
app.use('/api/users', require('./routes/users'));
app.use('/api/reviews', require('./routes/reviews'));

// ✅ Root test route
app.get('/', (req, res) => {
  res.json({ message: 'Prana Solutions API running ✅' });
});

// ✅ API test route (helps debug "Not Found")
app.get('/api', (req, res) => {
  res.json({ message: 'API working ✅' });
});

// ✅ Config
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// ✅ Connect MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected ✅');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} 🚀`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (no DB)`);
    });
  });

module.exports = app;