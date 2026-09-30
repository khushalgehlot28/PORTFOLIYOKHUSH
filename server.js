require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB Atlas Cloud!'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Schema for Contact Submissions
const submissionSchema = new mongoose.Schema({
  fullName:    { type: String, required: true, trim: true },
  email:       { type: String, required: true, trim: true, lowercase: true },
  subject:     { type: String, required: true, trim: true },
  projectType: { type: String, required: true, trim: true },
  timeline:    { type: String, default: 'Not specified', trim: true },
  message:     { type: String, required: true, trim: true },
  status:      { type: String, enum: ['unread', 'read', 'replied'], default: 'unread' }
}, { timestamps: true });

const Submission = mongoose.model('Submission', submissionSchema);

// JWT Auth Middleware to protect admin routes
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized. Token missing.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, error: 'Invalid or expired token.' });
  }
};

// --- PUBLIC ROUTES ---

// Submit Contact Form
app.post('/api/submit', async (req, res) => {
  try {
    const fullName = req.body.name || req.body.fullName;
    const email = req.body.email;
    const subject = req.body.subject;
    const projectType = req.body.projectType;
    const timeline = req.body.timeline || 'Not specified';
    const message = req.body.message;

    if (!fullName || !email || !subject || !projectType || !message) {
      return res.status(400).json({ success: false, error: 'All fields are required.' });
    }

    const newSubmission = new Submission({ fullName, email, subject, projectType, timeline, message });
    const savedData = await newSubmission.save();

    return res.status(201).json({ success: true, message: 'Message saved!', submissionId: savedData._id });
  } catch (error) {
    console.error('Database Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to save submission.' });
  }
});

// --- ADMIN ROUTES ---

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'password123';

  if (username === adminUser && password === adminPass) {
    const token = jwt.sign(
      { username }, 
      process.env.JWT_SECRET || 'fallback_secret', 
      { expiresIn: '12h' }
    );
    return res.json({ success: true, token });
  }

  return res.status(401).json({ success: false, error: 'Invalid credentials.' });
});

// Get All Submissions (Protected)
app.get('/api/admin/submissions', authenticateAdmin, async (req, res) => {
  try {
    const submissions = await Submission.find().sort({ createdAt: -1 });
    return res.json({ success: true, submissions });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch submissions.' });
  }
});

// Update Submission Status (Mark Read/Replied) (Protected)
app.patch('/api/admin/submissions/:id', authenticateAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Submission.findByIdAndUpdate(req.params.id, { status }, { new: true });
    return res.json({ success: true, submission: updated });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update status.' });
  }
});

// Delete Submission (Protected)
app.delete('/api/admin/submissions/:id', authenticateAdmin, async (req, res) => {
  try {
    await Submission.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Submission deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to delete submission.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));