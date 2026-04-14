# 🏥 Prana Solutions — Full-Stack MERN Application

> Trusted In-Home Care for Elders, Mothers & Children

A complete MERN stack web application built for Prana Solutions, a startup providing professional in-home caregiving services.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js 18, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT (JSON Web Tokens) + bcryptjs |
| UI | Custom CSS, Lucide Icons, Google Fonts |
| Notifications | react-hot-toast |

---

## 📁 Project Structure

```
prana-solutions/
├── server/                     # Backend (Node + Express)
│   ├── models/
│   │   ├── User.js             # User schema
│   │   ├── Caregiver.js        # Caregiver profile schema
│   │   ├── Booking.js          # Booking schema (full details)
│   │   └── Review.js           # Review/rating schema
│   ├── routes/
│   │   ├── auth.js             # Login, signup, /me
│   │   ├── bookings.js         # CRUD + health updates
│   │   ├── caregivers.js       # Caregiver profiles
│   │   ├── users.js            # User profile
│   │   └── reviews.js          # Ratings & reviews
│   ├── middleware/
│   │   └── auth.js             # JWT auth + role guard
│   ├── seed.js                 # Demo data seeder
│   ├── index.js                # Entry point
│   └── .env                    # Environment config
│
└── client/                     # Frontend (React)
    ├── public/
    │   └── index.html
    └── src/
        ├── context/
        │   └── AuthContext.js  # Global auth state
        ├── pages/
        │   ├── Landing.js      # Public landing page
        │   ├── Login.js        # Login page
        │   ├── Signup.js       # Signup (user/caregiver)
        │   ├── BookingForm.js  # 6-step booking wizard
        │   ├── UserDashboard.js
        │   ├── CaregiverDashboard.js
        │   └── AdminDashboard.js
        ├── App.js              # Routes + providers
        ├── App.css             # Global styles
        └── index.js
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd prana-solutions

# Install root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Configure Environment

Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/prana-solutions
JWT_SECRET=your_strong_secret_here
NODE_ENV=development
```

For MongoDB Atlas:
```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/prana-solutions
```

### 3. Seed Demo Data

```bash
cd server
node seed.js
```

### 4. Run the Application

```bash
# From root — run both servers simultaneously
npm run dev

# Or run individually:
npm run start:server    # Backend on http://localhost:5000
npm run start:client    # Frontend on http://localhost:3000
```

---

## 🔐 Demo Credentials

| Role | Email | Password |
|---|---|---|
| User | user@demo.com | demo123 |
| Caregiver | caregiver@demo.com | demo123 |
| Admin | admin@demo.com | demo123 |

---

## 📋 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/signup | Register user or caregiver |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |

### Bookings
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/bookings | Create booking |
| GET | /api/bookings | Get user's bookings |
| GET | /api/bookings/:id | Get single booking |
| PATCH | /api/bookings/:id/status | Update booking status |
| POST | /api/bookings/:id/health-update | Add health update |
| DELETE | /api/bookings/:id | Cancel booking |

### Caregivers
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/caregivers | List caregivers (with filters) |
| GET | /api/caregivers/me | Get own caregiver profile |
| GET | /api/caregivers/:id | Get caregiver by ID |
| PATCH | /api/caregivers/me | Update profile |

### Reviews
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/reviews | Submit review |
| GET | /api/reviews/caregiver/:id | Get caregiver reviews |

---

## 🗃️ Database Schemas

### User
- name, email, password (hashed), role (user/caregiver/admin), phone, address

### Caregiver
- user (ref), specializations[], experience, qualifications[], isVerified, isAvailable, rating, totalReviews, location, bio, schedule[]

### Booking
- user (ref), caregiver (ref), careType (elderly/maternity/childcare)
- patient: { name, age, gender, medicalConditions }
- careRequirements[], schedule: { startDate, endDate, timeSlot, duration }
- location: { address, city, pincode }
- additionalNotes, status, healthUpdates[]

### Review
- user (ref), caregiver (ref), booking (ref), rating (1–5), comment

---

## 🎯 Key Features

- ✅ Role-based authentication (User / Caregiver / Admin)
- ✅ 6-step booking wizard with full patient details
- ✅ AI-style caregiver matching (by care type, rating, availability)
- ✅ Real-time health updates from caregiver to family
- ✅ Booking status tracking (pending → assigned → active → completed)
- ✅ Caregiver dashboard: manage schedule, update care logs
- ✅ Admin dashboard: view all bookings and caregivers
- ✅ Fully responsive, mobile-friendly design
- ✅ Healthcare color theme (teal, green, white)
- ✅ JWT-secured REST APIs

---

## 🌐 Deployment

### Backend (Railway / Render)
1. Push `server/` to GitHub
2. Connect to Railway or Render
3. Set environment variables
4. Deploy

### Frontend (Vercel / Netlify)
1. `cd client && npm run build`
2. Deploy `build/` folder to Vercel or Netlify
3. Set `REACT_APP_API_URL=https://your-backend-url.com/api`

---

## 👥 Team

**Prana Solutions** — RGUKT RK Valley, Kadapa, Andhra Pradesh  
Wadhwani Foundation Entrepreneurship Program

---

## 📄 License

MIT License — Free to use for educational and commercial purposes.
