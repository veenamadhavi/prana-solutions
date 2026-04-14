const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://prana-solutions-acl7.vercel.app'
  ],
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/caregivers', require('./routes/caregivers'));
app.use('/api/users', require('./routes/users'));
app.use('/api/reviews', require('./routes/reviews'));

// Root
app.get('/', (req, res) => {
  res.json({ message: 'Prana Solutions API running ✅' });
});

// ✅ ADD THIS
app.get('/api', (req, res) => {
  res.json({ message: 'API working ✅' });
});

// Config
const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGO_URI;

// DB connect
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected ✅');
    app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });

module.exports = app;