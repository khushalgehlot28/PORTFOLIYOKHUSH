require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();

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

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

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

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const adminUser = getAdminUser();
  const adminPass = getAdminPass();

  if (username === adminUser && password === adminPass) {
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '12h' });
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
    const updated = await Submission.findByIdAndUpdate(req.params.id, { tag, internalNote }, { new: true });
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

const projectSchema = new mongoose.Schema({
  title:        { type: String, required: true, trim: true },
  category:     { type: String, required: true, trim: true },
  description:  { type: String, required: true, trim: true },
  technologies: [{ type: String, trim: true }],
  goal:         { type: String, default: '', trim: true },
  process:      { type: String, default: '', trim: true },
  features:     [{ type: String, trim: true }],
  github:       { type: String, default: '', trim: true },
  liveDemo:     { type: String, default: '', trim: true },
  className:    { type: String, default: 'tile-1', trim: true },
  isFeatured:   { type: Boolean, default: true }
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);

// --- PUBLIC PROJECT ROUTES ---
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    return res.json(projects); // Returns array directly to match app.js loops
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch projects.' });
  }
});

// --- ADMIN PROJECT ROUTES ---
app.post('/api/admin/projects', authenticateAdmin, async (req, res) => {
  try {
    const { title, category, description, technologies, goal, process, features, github, liveDemo, className, isFeatured } = req.body;
    if (!title || !category || !description) {
      return res.status(400).json({ success: false, error: 'Title, category, and description are required.' });
    }

    const project = new Project({
      title, category, description,
      technologies: Array.isArray(technologies) ? technologies : technologies.split(',').map(s => s.trim()),
      goal, process,
      features: Array.isArray(features) ? features : features.split(',').map(s => s.trim()),
      github, liveDemo, className, isFeatured
    });

    const savedProject = await project.save();
    return res.status(201).json({ success: true, project: savedProject });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to create project.' });
  }
});

app.put('/api/admin/projects/:id', authenticateAdmin, async (req, res) => {
  try {
    const { technologies, features } = req.body;
    const updateData = { ...req.body };

    if (typeof technologies === 'string') updateData.technologies = technologies.split(',').map(s => s.trim());
    if (typeof features === 'string') updateData.features = features.split(',').map(s => s.trim());

    const updated = await Project.findByIdAndUpdate(req.params.id, updateData, { new: true });
    return res.json({ success: true, project: updated });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update project.' });
  }
});

app.delete('/api/admin/projects/:id', authenticateAdmin, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Project deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to delete project.' });
  }
});


// =====================================================
// --- BLOG POST SCHEMA & ROUTES (NEWLY ADDED) ---
// =====================================================

const postSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  category:    { type: String, required: true, trim: true },
  date:        { type: String, required: true, trim: true }, // e.g., 'Experience 01'
  readingTime: { type: String, required: true, trim: true }, // e.g., '4 min read'
  excerpt:     { type: String, required: true, trim: true },
  image:       { type: String, default: '', trim: true },
  imageAlt:    { type: String, default: '', trim: true }
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);

// --- PUBLIC BLOG POST ROUTES ---
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    return res.json(posts); // Returns array directly to match app.js rendering loops
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch posts.' });
  }
});

// --- ADMIN BLOG POST ROUTES ---
app.post('/api/admin/posts', authenticateAdmin, async (req, res) => {
  try {
    const { title, category, date, readingTime, excerpt, image, imageAlt } = req.body;
    if (!title || !category || !excerpt) {
      return res.status(400).json({ success: false, error: 'Title, category, and excerpt are required.' });
    }

    const newPost = new Post({ title, category, date, readingTime, excerpt, image, imageAlt });
    const savedPost = await newPost.save();
    return res.status(201).json({ success: true, post: savedPost });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to create blog post.' });
  }
});

app.put('/api/admin/posts/:id', authenticateAdmin, async (req, res) => {
  try {
    const updated = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.json({ success: true, post: updated });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update blog post.' });
  }
});

app.delete('/api/admin/posts/:id', authenticateAdmin, async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Blog post deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to delete blog post.' });
  }
});
// =====================================================


// --- ONE-CLICK SEED ROUTE ---
app.post('/api/admin/projects/seed', authenticateAdmin, async (req, res) => {
  try {
    const count = await Project.countDocuments();
    if (count > 0) return res.json({ success: true, message: 'Projects already exist in database.' });

    const defaultProjects = [
      { className: 'tile-1', category: 'Frontend', title: 'StudioNova Identity', description: 'A visual identity system and responsive landing page concept for a creative studio.', technologies: ['HTML', 'CSS', 'JavaScript'], goal: 'Create a confident digital home for a small creative studio.', process: 'Defined visual direction, built reusable layout patterns, and tuned responsive states.', features: ['Responsive layout', 'Reusable visual tokens', 'Accessible navigation'] },
      { className: 'tile-2', category: 'Product UI', title: 'Finly Mobile UI', description: 'A calm personal-finance interface concept focused on clarity and quick daily decisions.', technologies: ['HTML', 'CSS', 'JavaScript'], goal: 'Make everyday money tracking feel approachable.', process: 'Mapped the core flow, designed key states, and implemented a mobile-first interface.', features: ['Mobile-first UI', 'Clear data hierarchy', 'Empty and active states'] },
      { className: 'tile-3', category: 'Content', title: 'Behind the Build', description: 'A content format for documenting design decisions, experiments, and the work behind the screen.', technologies: ['Content systems', 'Editing', 'Storytelling'], goal: 'Turn the making process into useful, honest content.', process: 'Outlined repeatable formats, created a visual rhythm, and documented the workflow.', features: ['Repeatable format', 'Process storytelling', 'Consistent visual language'] },
      { className: 'tile-4', category: 'Web', title: 'Portfolio Redesign', description: 'This portfolio: a lightweight single-page experience with accessible navigation and an editable data layer.', technologies: ['HTML', 'CSS', 'JavaScript'], goal: 'Build a personal site that is easy to update and pleasant to explore.', process: 'Separated styles, centralized content, and added responsive interaction patterns.', features: ['Hash navigation', 'Theme persistence', 'Case-study modal', 'Reduced-motion support'] }
    ];

    await Project.insertMany(defaultProjects);
    return res.json({ success: true, message: 'Seeded default projects successfully!' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to seed projects.' });
  }
});

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