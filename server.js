// --- PROJECT SCHEMA ---
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
    return res.json({ success: true, projects });
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