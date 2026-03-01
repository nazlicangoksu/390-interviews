import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { parse, stringify } from 'yaml';
import chokidar from 'chokidar';
import multer from 'multer';
import { runSynthesisAgent } from './synthesis-agent';

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
const BARRIERS_FILE = path.join(DATA_DIR, 'barriers.yaml');

// Ensure directories exist
if (!fs.existsSync(SESSIONS_DIR)) {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

// In-memory cache for concepts
let conceptsCache: any[] = [];
let topicsCache: any[] = [];
let barriersCache: any[] = [];

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

// Load barriers from YAML file
function loadBarriers() {
  try {
    const content = fs.readFileSync(BARRIERS_FILE, 'utf-8');
    const data = parse(content);
    barriersCache = data.barriers || [];
    console.log(`Loaded ${barriersCache.length} barriers`);
  } catch (err) {
    console.error('Error loading barriers:', err);
    barriersCache = [];
  }
}

// Initial load
loadConcepts();
loadTopics();
loadBarriers();

// Watch for file changes
const watcher = chokidar.watch([CONCEPTS_DIR, TOPICS_FILE, BARRIERS_FILE], {
  ignoreInitial: true,
  awaitWriteFinish: { stabilityThreshold: 300 }
});

watcher.on('all', (event, filePath) => {
  console.log(`File ${event}: ${filePath}`);
  if (filePath.includes('concepts')) {
    loadConcepts();
  } else if (filePath.includes('topics')) {
    loadTopics();
  } else if (filePath.includes('barriers')) {
    loadBarriers();
  }
});

// Participant group classification
type ParticipantGroup = 'investor' | 'scientist' | 'policy';

function classifyParticipantGroup(role: string, orgType: string): ParticipantGroup {
  const r = (role || '').toLowerCase();
  const o = (orgType || '').toLowerCase();

  if (r.includes('scientist') || r.includes('researcher') || r.includes('professor')
    || r.includes('academic') || o.includes('university') || o.includes('research')) {
    return 'scientist';
  }
  if (r.includes('policy') || r.includes('analyst') || r.includes('government')
    || r.includes('regulator') || o.includes('government') || o.includes('ngo')
    || o.includes('think tank')) {
    return 'policy';
  }
  return 'investor';
}

function loadAllSessions(): any[] {
  const files = fs.readdirSync(SESSIONS_DIR).filter(f => f.endsWith('.json'));
  return files.map(file => {
    const content = fs.readFileSync(path.join(SESSIONS_DIR, file), 'utf-8');
    return JSON.parse(content);
  });
}

function computeSignalStrength(mentionCount: number, avgRating: number, selectedCount: number): 'none' | 'low' | 'medium' | 'high' {
  const score = selectedCount * 2 + mentionCount + avgRating;
  if (score === 0) return 'none';
  if (score < 3) return 'low';
  if (score < 8) return 'medium';
  return 'high';
}

// GET /api/synthesis/aggregate
app.get('/api/synthesis/aggregate', (req, res) => {
  try {
    let sessions = loadAllSessions();

    // Apply filters
    const groupsParam = req.query.groups as string | undefined;
    const completedParam = req.query.completed as string | undefined;
    const fromParam = req.query.from as string | undefined;
    const toParam = req.query.to as string | undefined;

    if (groupsParam) {
      const allowedGroups = groupsParam.split(',') as ParticipantGroup[];
      sessions = sessions.filter(s =>
        allowedGroups.includes(classifyParticipantGroup(s.participantRole, s.organizationType))
      );
    }

    if (completedParam === 'completed') {
      sessions = sessions.filter(s => s.endTime);
    } else if (completedParam === 'in-progress') {
      sessions = sessions.filter(s => !s.endTime);
    }

    if (fromParam) {
      const fromDate = new Date(fromParam).getTime();
      sessions = sessions.filter(s => new Date(s.startTime).getTime() >= fromDate);
    }
    if (toParam) {
      const toDate = new Date(toParam).getTime();
      sessions = sessions.filter(s => new Date(s.startTime).getTime() <= toDate);
    }

    // Stats
    const byGroup: Record<ParticipantGroup, number> = { investor: 0, scientist: 0, policy: 0 };
    const byOrganizationType: Record<string, number> = {};
    const byRole: Record<string, number> = {};

    for (const s of sessions) {
      const group = classifyParticipantGroup(s.participantRole, s.organizationType);
      byGroup[group]++;
      byOrganizationType[s.organizationType] = (byOrganizationType[s.organizationType] || 0) + 1;
      byRole[s.participantRole] = (byRole[s.participantRole] || 0) + 1;
    }

    const timestamps = sessions.map(s => s.startTime).filter(Boolean).sort();
    const stats = {
      totalSessions: sessions.length,
      completedSessions: sessions.filter(s => s.endTime).length,
      inProgressSessions: sessions.filter(s => !s.endTime).length,
      byGroup,
      byOrganizationType,
      byRole,
      dateRange: {
        earliest: timestamps[0] || '',
        latest: timestamps[timestamps.length - 1] || '',
      },
    };

    // Concept rankings
    const conceptFeedbackMap: Record<string, {
      ratings: number[];
      notes: string[];
      modifications: string[];
      reviewerGroups: Record<ParticipantGroup, number>;
    }> = {};

    for (const s of sessions) {
      const group = classifyParticipantGroup(s.participantRole, s.organizationType);
      const feedback = s.conceptFeedback || {};
      for (const [conceptId, fb] of Object.entries(feedback) as [string, any][]) {
        if (!conceptFeedbackMap[conceptId]) {
          conceptFeedbackMap[conceptId] = {
            ratings: [],
            notes: [],
            modifications: [],
            reviewerGroups: { investor: 0, scientist: 0, policy: 0 },
          };
        }
        const entry = conceptFeedbackMap[conceptId];
        if (fb.rating > 0) entry.ratings.push(fb.rating);
        if (fb.notes) entry.notes.push(fb.notes);
        if (fb.modifications) entry.modifications.push(fb.modifications);
        entry.reviewerGroups[group]++;
      }
    }

    const conceptRankings = Object.entries(conceptFeedbackMap).map(([conceptId, data]) => {
      const concept = conceptsCache.find((c: any) => c.id === conceptId);
      const dist = [0, 0, 0, 0, 0];
      for (const r of data.ratings) {
        if (r >= 1 && r <= 5) dist[r - 1]++;
      }
      const avg = data.ratings.length > 0
        ? data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length
        : 0;
      return {
        conceptId,
        conceptName: concept?.name || conceptId,
        timesReviewed: data.notes.length + data.modifications.length > 0
          ? Object.values(data.reviewerGroups).reduce((a, b) => a + b, 0)
          : 0,
        averageRating: Math.round(avg * 10) / 10,
        ratingsDistribution: dist,
        reviewerGroups: data.reviewerGroups,
        sampleNotes: data.notes.filter(n => n.length > 0).slice(0, 5),
        sampleModifications: data.modifications.filter(m => m.length > 0).slice(0, 5),
      };
    }).sort((a, b) => b.averageRating - a.averageRating || b.timesReviewed - a.timesReviewed);

    // Barrier frequencies
    const barrierCountMap: Record<string, {
      count: number;
      byGroup: Record<ParticipantGroup, number>;
      byOrganizationType: Record<string, number>;
    }> = {};

    for (const s of sessions) {
      const group = classifyParticipantGroup(s.participantRole, s.organizationType);
      for (const barrierId of (s.selectedBarriers || [])) {
        if (!barrierCountMap[barrierId]) {
          barrierCountMap[barrierId] = {
            count: 0,
            byGroup: { investor: 0, scientist: 0, policy: 0 },
            byOrganizationType: {},
          };
        }
        barrierCountMap[barrierId].count++;
        barrierCountMap[barrierId].byGroup[group]++;
        barrierCountMap[barrierId].byOrganizationType[s.organizationType] =
          (barrierCountMap[barrierId].byOrganizationType[s.organizationType] || 0) + 1;
      }
    }

    const barrierFrequencies = Object.entries(barrierCountMap).map(([barrierId, data]) => {
      const barrier = barriersCache.find((b: any) => b.id === barrierId);
      return {
        barrierId,
        barrierName: barrier?.name || barrierId,
        ...data,
      };
    }).sort((a, b) => b.count - a.count);

    // Custom barriers
    const customBarrierMap: Record<string, { count: number; sessions: string[] }> = {};
    for (const s of sessions) {
      for (const cb of (s.customBarriers || [])) {
        const key = cb.toLowerCase().trim();
        if (!customBarrierMap[key]) customBarrierMap[key] = { count: 0, sessions: [] };
        customBarrierMap[key].count++;
        customBarrierMap[key].sessions.push(s.id);
      }
    }
    const customBarriers = Object.entries(customBarrierMap).map(([text, data]) => ({
      text, ...data,
    })).sort((a, b) => b.count - a.count);

    // Topic frequencies
    const topicCountMap: Record<string, {
      count: number;
      byGroup: Record<ParticipantGroup, number>;
    }> = {};

    for (const s of sessions) {
      const group = classifyParticipantGroup(s.participantRole, s.organizationType);
      for (const topicId of (s.selectedTopics || [])) {
        if (!topicCountMap[topicId]) {
          topicCountMap[topicId] = { count: 0, byGroup: { investor: 0, scientist: 0, policy: 0 } };
        }
        topicCountMap[topicId].count++;
        topicCountMap[topicId].byGroup[group]++;
      }
    }

    const topicFrequencies = Object.entries(topicCountMap).map(([topicId, data]) => {
      const topic = topicsCache.find((t: any) => t.id === topicId);
      return {
        topicId,
        topicName: topic?.name || topicId,
        ...data,
      };
    }).sort((a, b) => b.count - a.count);

    // Custom topics
    const customTopicMap: Record<string, { count: number; sessions: string[] }> = {};
    for (const s of sessions) {
      for (const ct of (s.customTopics || [])) {
        const key = ct.toLowerCase().trim();
        if (!customTopicMap[key]) customTopicMap[key] = { count: 0, sessions: [] };
        customTopicMap[key].count++;
        customTopicMap[key].sessions.push(s.id);
      }
    }
    const customTopics = Object.entries(customTopicMap).map(([text, data]) => ({
      text, ...data,
    })).sort((a, b) => b.count - a.count);

    // Triangulation matrix
    const triangulationMatrix = topicsCache.map((topic: any) => {
      const groups: ParticipantGroup[] = ['investor', 'scientist', 'policy'];
      const signals: Record<string, any> = {};

      for (const group of groups) {
        const groupSessions = sessions.filter(s =>
          classifyParticipantGroup(s.participantRole, s.organizationType) === group
        );

        const selectedCount = groupSessions.filter(s =>
          (s.selectedTopics || []).includes(topic.id)
        ).length;

        // Average rating of concepts tagged with this topic from this group
        const conceptsForTopic = conceptsCache.filter((c: any) => (c.topics || []).includes(topic.id));
        let totalRating = 0;
        let ratingCount = 0;
        let mentionCount = 0;

        for (const s of groupSessions) {
          for (const c of conceptsForTopic) {
            const fb = (s.conceptFeedback || {})[c.id];
            if (fb) {
              mentionCount++;
              if (fb.rating > 0) {
                totalRating += fb.rating;
                ratingCount++;
              }
            }
          }
        }

        const avgRating = ratingCount > 0 ? Math.round((totalRating / ratingCount) * 10) / 10 : 0;
        signals[group] = {
          mentionCount,
          averageConceptRating: avgRating,
          selectedCount,
          strength: computeSignalStrength(mentionCount, avgRating, selectedCount),
        };
      }

      // Alignment score: geometric mean of signal strengths
      const strengthValues = { none: 0, low: 1, medium: 2, high: 3 };
      const groupStrengths = groups.map(g => strengthValues[signals[g].strength as keyof typeof strengthValues]);
      const maxPossible = 3;
      const alignmentScore = groupStrengths.every(v => v > 0)
        ? Math.round((Math.pow(groupStrengths.reduce((a, b) => a * b, 1), 1 / 3) / maxPossible) * 100) / 100
        : 0;

      return {
        topicId: topic.id,
        topicName: topic.name,
        investor: signals.investor,
        scientist: signals.scientist,
        policy: signals.policy,
        alignmentScore,
      };
    });

    res.json({
      stats,
      conceptRankings,
      barrierFrequencies,
      customBarriers,
      topicFrequencies,
      customTopics,
      triangulationMatrix,
    });
  } catch (err) {
    console.error('Error computing synthesis aggregate:', err);
    res.status(500).json({ error: 'Failed to compute synthesis' });
  }
});

// Synthesis cache directory
const SYNTHESIS_CACHE_DIR = path.join(DATA_DIR, 'synthesis-cache');
if (!fs.existsSync(SYNTHESIS_CACHE_DIR)) {
  fs.mkdirSync(SYNTHESIS_CACHE_DIR, { recursive: true });
}

// POST /api/synthesis/analyze - Run AI analysis
app.post('/api/synthesis/analyze', async (req, res) => {
  const { type, params } = req.body;

  if (!type) {
    return res.status(400).json({ error: 'Analysis type is required' });
  }

  // Check API key
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'ANTHROPIC_API_KEY not configured. Set it in .env file.' });
  }

  // Build cache key
  const cacheKey = `${type}-${JSON.stringify(params || {})}`.replace(/[^a-zA-Z0-9-]/g, '_');
  const cachePath = path.join(SYNTHESIS_CACHE_DIR, `${cacheKey}.json`);

  // Check cache
  if (fs.existsSync(cachePath)) {
    try {
      const cached = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
      const ageHours = (Date.now() - new Date(cached.generatedAt).getTime()) / (1000 * 60 * 60);
      const currentSessionCount = fs.readdirSync(SESSIONS_DIR).filter(f => f.endsWith('.json')).length;

      if (ageHours < 24 && cached.sessionCount === currentSessionCount) {
        return res.json({ ...cached, cached: true });
      }
    } catch {
      // Invalid cache, regenerate
    }
  }

  try {
    const result = await runSynthesisAgent(type, params);

    const analysisResult = {
      id: cacheKey,
      type,
      params,
      content: result.content,
      generatedAt: new Date().toISOString(),
      sessionCount: result.sessionCount,
      cached: false,
    };

    // Cache result
    fs.writeFileSync(cachePath, JSON.stringify(analysisResult, null, 2), 'utf-8');

    res.json(analysisResult);
  } catch (err: any) {
    console.error('Error running synthesis agent:', err);
    res.status(500).json({ error: err.message || 'Analysis failed' });
  }
});

// GET /api/synthesis/analyses - Get all cached analyses
app.get('/api/synthesis/analyses', (req, res) => {
  try {
    if (!fs.existsSync(SYNTHESIS_CACHE_DIR)) {
      return res.json([]);
    }
    const files = fs.readdirSync(SYNTHESIS_CACHE_DIR).filter(f => f.endsWith('.json'));
    const analyses = files.map(file => {
      const content = fs.readFileSync(path.join(SYNTHESIS_CACHE_DIR, file), 'utf-8');
      return JSON.parse(content);
    });
    res.json(analyses);
  } catch (err) {
    console.error('Error reading analyses cache:', err);
    res.json([]);
  }
});

// DELETE /api/synthesis/cache - Clear all cached analyses
app.delete('/api/synthesis/cache', (req, res) => {
  try {
    if (fs.existsSync(SYNTHESIS_CACHE_DIR)) {
      const files = fs.readdirSync(SYNTHESIS_CACHE_DIR).filter(f => f.endsWith('.json'));
      for (const file of files) {
        fs.unlinkSync(path.join(SYNTHESIS_CACHE_DIR, file));
      }
    }
    res.json({ success: true, cleared: true });
  } catch (err) {
    console.error('Error clearing synthesis cache:', err);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

// GET /api/synthesis/export - Export synthesis data
app.get('/api/synthesis/export', (req, res) => {
  const format = req.query.format as string || 'json';

  try {
    // Load aggregate data
    const sessions = loadAllSessions();
    const sessionCount = sessions.length;

    // Load cached analyses
    let analyses: any[] = [];
    if (fs.existsSync(SYNTHESIS_CACHE_DIR)) {
      const files = fs.readdirSync(SYNTHESIS_CACHE_DIR).filter(f => f.endsWith('.json'));
      analyses = files.map(file => JSON.parse(fs.readFileSync(path.join(SYNTHESIS_CACHE_DIR, file), 'utf-8')));
    }

    if (format === 'markdown') {
      let md = `# Climate Investment Research Synthesis\n\n`;
      md += `Generated: ${new Date().toLocaleDateString()}\n`;
      md += `Sessions analyzed: ${sessionCount}\n\n`;

      // Add each cached analysis
      const sectionOrder = ['thematic', 'decision-framework', 'triangulation', 'key-quotes', 'paper-section', 'concept-synthesis'];
      const sectionTitles: Record<string, string> = {
        'thematic': 'Thematic Analysis',
        'decision-framework': 'Decision Framework',
        'triangulation': 'Triangulation',
        'key-quotes': 'Key Quotes',
        'paper-section': 'Paper Section Draft',
        'concept-synthesis': 'Concept Synthesis',
      };

      for (const type of sectionOrder) {
        const matching = analyses.filter(a => a.type === type);
        for (const analysis of matching) {
          md += `## ${sectionTitles[type] || type}`;
          if (analysis.params?.participantGroup) md += ` (${analysis.params.participantGroup})`;
          if (analysis.params?.paperSection) md += ` (Part ${analysis.params.paperSection})`;
          if (analysis.params?.conceptId) md += ` (${analysis.params.conceptId})`;
          md += `\n\n${analysis.content}\n\n---\n\n`;
        }
      }

      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', 'attachment; filename=synthesis.md');
      res.send(md);
    } else {
      const exportData = {
        exportedAt: new Date().toISOString(),
        sessionCount,
        analyses,
        sessions: sessions.map(s => ({
          id: s.id,
          participantId: s.participantId,
          participantRole: s.participantRole,
          organizationType: s.organizationType,
          hasInvestedInClimate: s.hasInvestedInClimate,
          selectedTopics: s.selectedTopics,
          selectedBarriers: s.selectedBarriers,
          conceptFeedbackCount: Object.keys(s.conceptFeedback || {}).length,
          sessionConceptCount: (s.sessionConcepts || []).length,
          hasNotes: !!s.notes,
          completed: !!s.endTime,
        })),
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=synthesis.json');
      res.json(exportData);
    }
  } catch (err) {
    console.error('Error exporting synthesis:', err);
    res.status(500).json({ error: 'Export failed' });
  }
});

// API Routes

// GET /api/topics - Get all topics
app.get('/api/topics', (req, res) => {
  res.json(topicsCache);
});

// GET /api/barriers - Get all barriers
app.get('/api/barriers', (req, res) => {
  res.json(barriersCache);
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

// POST /api/concepts - Create new concept
app.post('/api/concepts', (req, res) => {
  const newConcept = req.body;

  if (!newConcept.id || !newConcept.name) {
    return res.status(400).json({ error: 'Concept id and name are required' });
  }

  const filePath = path.join(CONCEPTS_DIR, `${newConcept.id}.yaml`);

  if (fs.existsSync(filePath)) {
    return res.status(409).json({ error: 'Concept with this ID already exists' });
  }

  try {
    fs.writeFileSync(filePath, stringify(newConcept), 'utf-8');
    res.status(201).json({ success: true, concept: newConcept });
  } catch (err) {
    console.error('Error creating concept:', err);
    res.status(500).json({ error: 'Failed to create concept' });
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

// ── Questions (audience engagement on Emerging Synthesis page) ────────────────

const QUESTIONS_FILE = path.join(DATA_DIR, 'questions.json');

function loadQuestions(): any[] {
  if (!fs.existsSync(QUESTIONS_FILE)) return [];
  return JSON.parse(fs.readFileSync(QUESTIONS_FILE, 'utf-8'));
}

function saveQuestions(questions: any[]) {
  fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2), 'utf-8');
}

app.get('/api/questions', (req, res) => {
  const questions = loadQuestions();
  const sectionId = req.query.sectionId as string;
  res.json(sectionId ? questions.filter((q: any) => q.sectionId === sectionId) : questions);
});

app.post('/api/questions', (req, res) => {
  const { sectionId, text, author } = req.body;
  if (!sectionId || !text) {
    return res.status(400).json({ error: 'sectionId and text are required' });
  }
  const question = {
    id: `q-${Date.now()}`,
    sectionId,
    text: text.trim(),
    author: author?.trim() || 'Anonymous',
    timestamp: new Date().toISOString(),
  };
  const questions = loadQuestions();
  questions.push(question);
  saveQuestions(questions);
  res.status(201).json(question);
});

app.delete('/api/questions/:id', (req, res) => {
  const questions = loadQuestions().filter((q: any) => q.id !== req.params.id);
  saveQuestions(questions);
  res.json({ success: true });
});

// ── Reactions (insight engagement) ────────────────────────────────────────────

const REACTIONS_FILE = path.join(DATA_DIR, 'reactions.json');

function loadReactions(): Record<string, Record<string, number>> {
  if (!fs.existsSync(REACTIONS_FILE)) return {};
  return JSON.parse(fs.readFileSync(REACTIONS_FILE, 'utf-8'));
}

function saveReactions(reactions: Record<string, Record<string, number>>) {
  fs.writeFileSync(REACTIONS_FILE, JSON.stringify(reactions, null, 2), 'utf-8');
}

app.get('/api/reactions', (_req, res) => {
  res.json(loadReactions());
});

app.post('/api/reactions', (req, res) => {
  const { sectionId, reaction } = req.body;
  const allowed = ['surprising', 'seen-this', 'tell-more'];
  if (!sectionId || !reaction || !allowed.includes(reaction)) {
    return res.status(400).json({ error: 'sectionId and valid reaction required' });
  }
  const reactions = loadReactions();
  if (!reactions[sectionId]) reactions[sectionId] = {};
  reactions[sectionId][reaction] = (reactions[sectionId][reaction] || 0) + 1;
  saveReactions(reactions);
  res.json(reactions[sectionId]);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
