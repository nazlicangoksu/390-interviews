import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { parse, stringify } from 'yaml';
import chokidar from 'chokidar';
import multer from 'multer';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Configure multer for image uploads
const IMAGES_DIR = path.join(__dirname, '..', 'client', 'public', 'images', 'concepts');

// Ensure images directory exists
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, IMAGES_DIR);
  },
  filename: (req, file, cb) => {
    const conceptId = req.params.id;
    const ext = path.extname(file.originalname);
    cb(null, `${conceptId}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Paths
const DATA_DIR = path.join(__dirname, '..', 'data');
const CONCEPTS_DIR = path.join(DATA_DIR, 'concepts');
const SESSIONS_DIR = path.join(DATA_DIR, 'sessions');
const TOPICS_FILE = path.join(DATA_DIR, 'topics.yaml');

// Ensure directories exist
if (!fs.existsSync(SESSIONS_DIR)) {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

// In-memory cache for concepts
let conceptsCache: any[] = [];
let topicsCache: any[] = [];

// Load all concepts from YAML files
function loadConcepts() {
  const concepts: any[] = [];
  const files = fs.readdirSync(CONCEPTS_DIR).filter(f => f.endsWith('.yaml'));

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(CONCEPTS_DIR, file), 'utf-8');
      const concept = parse(content);
      concepts.push(concept);
    } catch (err) {
      console.error(`Error loading concept ${file}:`, err);
    }
  }

  conceptsCache = concepts;
  console.log(`Loaded ${concepts.length} concepts`);
}

// Load topics from YAML file
function loadTopics() {
  try {
    const content = fs.readFileSync(TOPICS_FILE, 'utf-8');
    const data = parse(content);
    topicsCache = data.topics || [];
    console.log(`Loaded ${topicsCache.length} topics`);
  } catch (err) {
    console.error('Error loading topics:', err);
    topicsCache = [];
  }
}

// Initial load
loadConcepts();
loadTopics();

// Watch for file changes
const watcher = chokidar.watch([CONCEPTS_DIR, TOPICS_FILE], {
  ignoreInitial: true,
  awaitWriteFinish: { stabilityThreshold: 300 }
});

watcher.on('all', (event, filePath) => {
  console.log(`File ${event}: ${filePath}`);
  if (filePath.includes('concepts')) {
    loadConcepts();
  } else if (filePath.includes('topics')) {
    loadTopics();
  }
});

// API Routes

// GET /api/topics - Get all topics
app.get('/api/topics', (req, res) => {
  res.json(topicsCache);
});

// GET /api/concepts - Get all concepts
app.get('/api/concepts', (req, res) => {
  res.json(conceptsCache);
});

// PATCH /api/concepts/:id/topics - Update concept topics
app.patch('/api/concepts/:id/topics', (req, res) => {
  const { id } = req.params;
  const { topics } = req.body;

  const filePath = path.join(CONCEPTS_DIR, `${id}.yaml`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Concept not found' });
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const concept = parse(content);
    concept.topics = topics;
    fs.writeFileSync(filePath, stringify(concept), 'utf-8');
    res.json({ success: true, concept });
  } catch (err) {
    console.error('Error updating concept topics:', err);
    res.status(500).json({ error: 'Failed to update concept' });
  }
});

// PUT /api/concepts/:id - Update entire concept
app.put('/api/concepts/:id', (req, res) => {
  const { id } = req.params;
  const updatedConcept = req.body;

  const filePath = path.join(CONCEPTS_DIR, `${id}.yaml`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Concept not found' });
  }

  try {
    // Ensure the ID stays consistent
    updatedConcept.id = id;
    fs.writeFileSync(filePath, stringify(updatedConcept), 'utf-8');
    res.json({ success: true, concept: updatedConcept });
  } catch (err) {
    console.error('Error updating concept:', err);
    res.status(500).json({ error: 'Failed to update concept' });
  }
});

// POST /api/concepts/:id/image - Upload concept image
app.post('/api/concepts/:id/image', upload.single('image'), (req, res) => {
  const { id } = req.params;
  const filePath = path.join(CONCEPTS_DIR, `${id}.yaml`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Concept not found' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  try {
    // Update the concept's image field in the YAML
    const content = fs.readFileSync(filePath, 'utf-8');
    const concept = parse(content);
    concept.image = req.file.filename;
    fs.writeFileSync(filePath, stringify(concept), 'utf-8');

    res.json({
      success: true,
      image: req.file.filename,
      concept
    });
  } catch (err) {
    console.error('Error uploading concept image:', err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// GET /api/sessions - List all sessions
app.get('/api/sessions', (req, res) => {
  try {
    const files = fs.readdirSync(SESSIONS_DIR).filter(f => f.endsWith('.json'));
    const sessions = files.map(file => {
      const content = fs.readFileSync(path.join(SESSIONS_DIR, file), 'utf-8');
      return JSON.parse(content);
    });
    // Sort by startTime descending
    sessions.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    res.json(sessions);
  } catch (err) {
    console.error('Error listing sessions:', err);
    res.status(500).json({ error: 'Failed to list sessions' });
  }
});

// GET /api/sessions/:id - Get single session
app.get('/api/sessions/:id', (req, res) => {
  const { id } = req.params;
  const filePath = path.join(SESSIONS_DIR, `${id}.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Session not found' });
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    res.json(JSON.parse(content));
  } catch (err) {
    console.error('Error reading session:', err);
    res.status(500).json({ error: 'Failed to read session' });
  }
});

// POST /api/sessions - Create new session
app.post('/api/sessions', (req, res) => {
  const session = {
    ...req.body,
    id: req.body.id || `session-${Date.now()}`,
    startTime: req.body.startTime || new Date().toISOString()
  };

  const filePath = path.join(SESSIONS_DIR, `${session.id}.json`);

  try {
    fs.writeFileSync(filePath, JSON.stringify(session, null, 2), 'utf-8');
    res.status(201).json(session);
  } catch (err) {
    console.error('Error creating session:', err);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// PUT /api/sessions/:id - Update session
app.put('/api/sessions/:id', (req, res) => {
  const { id } = req.params;
  const filePath = path.join(SESSIONS_DIR, `${id}.json`);

  try {
    const session = { ...req.body, id };
    fs.writeFileSync(filePath, JSON.stringify(session, null, 2), 'utf-8');
    res.json(session);
  } catch (err) {
    console.error('Error updating session:', err);
    res.status(500).json({ error: 'Failed to update session' });
  }
});

// DELETE /api/sessions/:id - Delete session
app.delete('/api/sessions/:id', (req, res) => {
  const { id } = req.params;
  const filePath = path.join(SESSIONS_DIR, `${id}.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Session not found' });
  }

  try {
    fs.unlinkSync(filePath);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting session:', err);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
