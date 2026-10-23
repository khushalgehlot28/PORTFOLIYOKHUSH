require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();

// Fallback resolver for environment variable aliases
const getAdminUser = () => process.env.ADMIN_USER || process.env.ADMIN_USERNAME;
const getAdminPass = () => process.env.ADMIN_PASS || process.env.ADMIN_PASSWORD;

function validateEnvironment() {
  const missing = [];
  if (!process.env.MONGO_URI?.trim()) missing.push('MONGO_URI');
  if (!process.env.JWT_SECRET?.trim()) missing.push('JWT_SECRET');
  if (!getAdminUser()?.trim()) missing.push('ADMIN_USER (or ADMIN_USERNAME)');
  if (!getAdminPass()?.trim()) missing.push('ADMIN_PASS (or ADMIN_PASSWORD)');

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  let mongoUrl;
  try {
    mongoUrl = new URL(process.env.MONGO_URI);
  } catch (error) {
    throw new Error('MONGO_URI must be a valid MongoDB connection URI.');
  }

  if (!['mongodb:', 'mongodb+srv:'].includes(mongoUrl.protocol) || !mongoUrl.hostname) {
    throw new Error('MONGO_URI must use mongodb:// or mongodb+srv:// and include a host.');
  }
}

// Middleware
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Schema for Contact Submissions
const submissionSchema = new mongoose.Schema({
  fullName:    { type: String, required: true, trim: true },
  email:       { type: String, required: true, trim: true, lowercase: true },
  subject:     { type: String, required: true, trim: true },
  projectType: { type: String, required: true, trim: true },
  timeline:    { type: String, default: 'Not specified', trim: true },
  message:     { type: String, required: true, trim: true },
  status:      { type: String, enum: ['unread', 'read', 'replied'], default: 'unread' },
  tag:         { type: String, default: 'General', trim: true },
  internalNote:{ type: String, default: '', trim: true }
}, { timestamps: true });

const Submission = mongoose.model('Submission', submissionSchema);

// JWT Auth Middleware
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized. Token missing.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, error: 'Invalid or expired token.' });
  }
};

// --- PUBLIC ROUTES ---
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
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const adminUser = getAdminUser();
  const adminPass = getAdminPass();

  if (username === adminUser && password === adminPass) {
    const token = jwt.sign(
      { username }, 
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );
    return res.json({ success: true, token });
  }

  return res.status(401).json({ success: false, error: 'Invalid credentials.' });
});

app.get('/api/admin/submissions', authenticateAdmin, async (req, res) => {
  try {
    const submissions = await Submission.find().sort({ createdAt: -1 });
    return res.json({ success: true, submissions });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch submissions.' });
  }
});

app.patch('/api/admin/submissions/:id', authenticateAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Submission.findByIdAndUpdate(req.params.id, { status }, { new: true });
    return res.json({ success: true, submission: updated });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update status.' });
  }
});

app.patch('/api/admin/submissions/:id/details', authenticateAdmin, async (req, res) => {
  try {
    const { tag, internalNote } = req.body;
    const updated = await Submission.findByIdAndUpdate(
      req.params.id, 
      { tag, internalNote }, 
      { new: true }
    );
    return res.json({ success: true, submission: updated });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update details.' });
  }
});

app.delete('/api/admin/submissions/:id', authenticateAdmin, async (req, res) => {
  try {
    await Submission.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Submission deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to delete submission.' });
  }
});

// Server Initialization
async function startServer() {
  validateEnvironment();
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Successfully connected to MongoDB.');

  const PORT = process.env.PORT || 3000;
  return app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { app, startServer, validateEnvironment };