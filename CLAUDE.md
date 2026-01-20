# Climate Investment Interview Tool

## Purpose

This is a web application for conducting structured interviews about climate concepts. It allows researchers/interviewers to:

- Present climate-related concepts to interview participants
- Organize concepts by topics (categories)
- Record and manage interview sessions
- Upload images for visual concept representation

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Backend**: Express 5 + TypeScript (tsx)
- **Data Storage**: YAML files for concepts/topics, JSON files for sessions

## Project Structure

```
390_interview/
├── client/           # React frontend (Vite + TypeScript + Tailwind)
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── pages/        # Route pages
│       ├── hooks/        # Custom React hooks
│       └── types/        # TypeScript type definitions
├── server/           # Express backend
│   └── index.ts      # Main server file with all API routes
├── data/
│   ├── concepts/     # YAML files for climate concepts (one per concept)
│   ├── sessions/     # Interview session data (JSON files)
│   └── topics.yaml   # Topic/category definitions
└── package.json      # Root package.json with dev scripts
```

## Local Development

### Prerequisites

- Node.js v18 or higher
- npm

### Installation

```bash
# Install server dependencies (from root)
npm install

# Install client dependencies
cd client && npm install && cd ..
```

### Running the Application

```bash
# Run both server and client together (recommended)
npm run dev

# Or run separately:
npm run server   # Backend on http://localhost:3001
npm run client   # Frontend on http://localhost:5173
```

### URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/topics` | GET | Get all topics |
| `/api/concepts` | GET | Get all concepts |
| `/api/concepts/:id/topics` | PATCH | Update concept topics |
| `/api/concepts/:id` | PUT | Update entire concept |
| `/api/concepts/:id/image` | POST | Upload concept image |
| `/api/sessions` | GET | List all sessions |
| `/api/sessions/:id` | GET | Get single session |
| `/api/sessions` | POST | Create new session |
| `/api/sessions/:id` | PUT | Update session |
| `/api/sessions/:id` | DELETE | Delete session |

## Data Format

### Concepts (YAML)
Stored in `data/concepts/` as individual YAML files. Each concept has an id, title, description, topics array, and optional image.

### Topics (YAML)
Defined in `data/topics.yaml` - contains the list of available topic categories.

### Sessions (JSON)
Stored in `data/sessions/` as JSON files with session metadata and responses.

## Notes

- The server uses file-based storage with hot-reloading via chokidar
- Concept images are stored in `client/public/images/concepts/`
- Sessions directory is gitignored to avoid committing interview data
