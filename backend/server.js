import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import clubRoutes from './routes/clubRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import pstRoutes from './routes/pstRoutes.js';
import authRoutes from './routes/authRoutes.js';
import otpRoutes from './routes/otpRoutes.js';
import Club from './models/Club.js';
import Member from './models/Member.js';
import PST from './models/PST.js';
import User from './models/User.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB and seed default auth users
connectDB().then(async () => {
  try {
    const defaultUsers = [
      { name: 'Rajesh Sundaram (President)', email: 'president@vasaviclub.org', password: 'password123', role: 'admin' },
      { name: 'Ananya Venkatesh (Secretary)', email: 'secretary@vasaviclub.org', password: 'password123', role: 'admin' },
      { name: 'Central Chapter Admin', email: 'admin@vasaviclub.org', password: 'password123', role: 'admin' },
      { name: 'System Admin (LS)', email: 'admin@ls.in', password: 'admin123', role: 'admin' },
      { name: 'Siddharth Chandrasekar (Member)', email: 'member@vasaviclub.org', password: 'password123', role: 'member' },
    ];

    for (const u of defaultUsers) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        await User.create(u);
        console.log(`[SYS.AUTH // SEED] Created default account: ${u.email}`);
      }
    }

    // Normalize any legacy member roles in MongoDB to 'admin' or 'member'
    await Member.updateMany(
      { role: { $nin: ['admin', 'member'] } },
      { $set: { role: 'member' } }
    );

    let defaultClub = await Club.findOne({ status: 'Active' });
    if (!defaultClub) {
      defaultClub = await Club.create({
        clubNumber: 'VC-324A-01',
        clubName: 'Vasavi Club of Metropolitan Central',
        district: 'District V-324',
        multipleDistrict: 'VCI 324',
        region: 'Region II',
        zone: 'Zone 1',
        charterDate: new Date('1984-06-15'),
        status: 'Active',
        meetingSchedule: {
          frequency: 'First and Third Thursdays',
          day: 'Thursday',
          time: '19:30 IST',
          venue: 'Vasavi Seva Bhavan',
          address: '42 Vasavi Road, Mount Road',
          city: 'Chennai',
          postalCode: '600002',
        },
        contactEmail: 'contact@vasaviclub.org',
        contactPhone: '+91 44 2851 4090',
        website: 'https://vasaviclub.org',
        totalMembers: 3,
      });
      console.log(`[SYS.DB // SEED] Initialized default Vasavi Club: ${defaultClub.clubName}`);
    }
  } catch (e) {
    console.warn('[SYS.AUTH // SEED WARN]', e.message);
  }
});

// Global Middlewares - Production-ready CORS with Vercel & custom domain support
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      // Allow any localhost / loopback
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
      // Allow Vercel preview and production deployments
      if (origin.endsWith('.vercel.app') || origin.includes('vercel.app')) {
        return callback(null, true);
      }
      // Allow explicitly configured CLIENT_URL
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Permissive fallback in production
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware with clinical formatting
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[REQ // ${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Primary API Routes
app.use('/api/auth', authRoutes);
app.use('/api/otp', otpRoutes);
app.use(otpRoutes); // Allows direct /send-otp and /verify-otp
app.use('/api/clubs', clubRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/pst', pstRoutes);

// System Health & Telemetry Endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'][
    mongoose.connection.readyState
  ] || 'Unknown';

  res.json({
    status: 'OPERATIONAL',
    system: 'Vasavi Club International Chapter Portal Backend',
    aesthetic: 'Clinical Minimalist (The Ordinary Specification)',
    database: {
      status: dbStatus,
      host: mongoose.connection.host || 'localhost:27017',
      name: mongoose.connection.name || 'vasaviclub',
      uri: process.env.MONGO_URI || 'mongodb://localhost:27017/vasaviclub',
    },
    uptime: `${process.uptime().toFixed(1)}s`,
    timestamp: new Date().toISOString(),
  });
});

// Seed Data Endpoint (Generates initial Chapter data for MongoDB Compass)
app.post('/api/seed', async (req, res) => {
  try {
    // 1. Seed Club
    let club = await Club.findOne({ clubNumber: 'VC-324A-01' });
    if (!club) {
      club = await Club.create({
        clubNumber: 'VC-324A-01',
        clubName: 'Vasavi Club of Metropolitan Central',
        district: 'District V-324',
        multipleDistrict: 'VCI 324',
        region: 'Region II',
        zone: 'Zone 1',
        charterDate: new Date('1984-06-15'),
        status: 'Active',
        meetingSchedule: {
          frequency: 'First and Third Thursdays',
          day: 'Thursday',
          time: '19:30 IST',
          venue: 'Vasavi Seva Bhavan',
          address: '42 Vasavi Road, Mount Road',
          city: 'Chennai',
          postalCode: '600002',
        },
        contactEmail: 'contact@vasaviclub.org',
        contactPhone: '+91 44 2851 4090',
        website: 'https://vasaviclub.org',
        totalMembers: 3,
      });
    }

    // 2. Seed PST Members if needed
    let pres = await Member.findOne({ email: 'president@vasaviclub.org' });
    if (!pres) {
      pres = await Member.create({
        memberId: 'V-100201',
        firstName: 'Rajesh',
        lastName: 'Sundaram',
        dateOfBirth: new Date('1972-04-12'),
        gender: 'Male',
        bloodGroup: 'O+',
        occupation: 'Chartered Accountant & Senior Partner',
        email: 'president@vasaviclub.org',
        phone: '+91 98401 23456',
        address: '15 Anna Nagar 2nd Avenue',
        city: 'Chennai',
        postalCode: '600040',
        club: club._id,
        membershipType: 'Regular',
        role: 'admin',
        designation: 'Club President',
        status: 'Active',
      });
    }

    let sec = await Member.findOne({ email: 'secretary@vasaviclub.org' });
    if (!sec) {
      sec = await Member.create({
        memberId: 'V-100202',
        firstName: 'Ananya',
        lastName: 'Venkatesh',
        dateOfBirth: new Date('1980-09-24'),
        gender: 'Female',
        bloodGroup: 'A+',
        occupation: 'Healthcare Director & Surgeon',
        email: 'secretary@vasaviclub.org',
        phone: '+91 98402 34567',
        address: '88 Luz Church Road',
        city: 'Chennai',
        postalCode: '600004',
        club: club._id,
        membershipType: 'Regular',
        role: 'admin',
        designation: 'Club Secretary',
        status: 'Active',
      });
    }

    let treas = await Member.findOne({ email: 'treasurer@vasaviclub.org' });
    if (!treas) {
      treas = await Member.create({
        memberId: 'V-100203',
        firstName: 'Karthik',
        lastName: 'Narayanan',
        dateOfBirth: new Date('1978-11-05'),
        gender: 'Male',
        bloodGroup: 'B+',
        occupation: 'Managing Director, Infrastructure Pvt Ltd',
        email: 'treasurer@vasaviclub.org',
        phone: '+91 98403 45678',
        address: '24 Besant Avenue, Adyar',
        city: 'Chennai',
        postalCode: '600020',
        club: club._id,
        membershipType: 'Regular',
        role: 'member',
        designation: 'Club Treasurer',
        status: 'Active',
      });
    }

    // 3. Seed PST Cabinet
    let pst = await PST.findOne({ club: club._id, lionYear: '2024-2025' });
    if (!pst) {
      pst = await PST.create({
        lionYear: '2024-2025',
        club: club._id,
        president: {
          member: pres._id,
          officialEmail: pres.email,
          directPhone: pres.phone,
          termBio: 'Focused on youth education, scholarships, and community welfare.',
        },
        secretary: {
          member: sec._id,
          officialEmail: sec.email,
          directPhone: sec.phone,
          termBio: 'Spearheading digital records migration and community liaison programs.',
        },
        treasurer: {
          member: treas._id,
          officialEmail: treas.email,
          directPhone: treas.phone,
          termBio: 'Overseeing financial transparency, VCI grants, and audit reports.',
        },
        status: 'Incumbent',
        installedDate: new Date('2024-07-01'),
        cabinetMotto: 'Fellowship and Service',
      });
    }

    res.json({
      success: true,
      message: 'Vasavi Club seed dataset successfully written to MongoDB Compass database',
      club,
      pst,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not located at endpoint: ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SYS.ERR]', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Fault',
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` VASAVI CLUB INTL. // CHAPTER BACKEND SERVICE`);
  console.log(` RUNNING ON: http://localhost:${PORT}`);
  console.log(` TARGET DB: mongodb://localhost:27017/vasaviclub`);
  console.log(` HEALTH:     http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});

export default app;
