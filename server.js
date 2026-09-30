require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Database Connection
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB Atlas Cloud!'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Updated Schema to include all form fields
const submissionSchema = new mongoose.Schema({
  fullName:    { type: String, required: true, trim: true },
  email:       { type: String, required: true, trim: true, lowercase: true },
  subject:     { type: String, required: true, trim: true },
  projectType: { type: String, required: true, trim: true },
  timeline:    { type: String, default: 'Not specified', trim: true },
  message:     { type: String, required: true, trim: true }
}, { timestamps: true });

const Submission = mongoose.model('Submission', submissionSchema);

// Updated API Route
app.post('/api/submit', async (req, res) => {
  try {
    const fullName = req.body.name || req.body.fullName;
    const email = req.body.email;
    const subject = req.body.subject;
    const projectType = req.body.projectType;
    const timeline = req.body.timeline;
    const message = req.body.message;

    // Validate required fields
    if (!fullName || !email || !subject || !projectType || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please fill in all required fields (Name, Email, Subject, Help Type, Message).' 
      });
    }

    const newSubmission = new Submission({ 
      fullName, 
      email, 
      subject, 
      projectType, 
      timeline, 
      message 
    });

    const savedData = await newSubmission.save();

    return res.status(201).json({
      success: true,
      message: 'Thanks! Your message has been saved successfully.',
      submissionId: savedData._id
    });
  } catch (error) {
    console.error('Database Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to save submission.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));