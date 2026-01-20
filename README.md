# Climate Investment Interview Tool

A web application for conducting interviews about climate concepts.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (comes with Node.js)

## Installation

1. Clone the repository and navigate to the project directory:

   ```bash
   cd 390_interview
   ```

2. Install server dependencies:

   ```bash
   npm install
   ```

3. Install client dependencies:

   ```bash
   cd client
   npm install
   cd ..
   ```

## Running the Application

### Option 1: Run both server and client together (recommended)

```bash
npm run dev
```

This starts both the backend server and the frontend development server concurrently.

### Option 2: Run server and client separately

In one terminal, start the backend server:

```bash
npm run server
```

In another terminal, start the frontend:

```bash
npm run client
```

## Accessing the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

## Project Structure

```
390_interview/
├── client/           # React frontend (Vite + TypeScript + Tailwind)
├── server/           # Express backend
├── data/
│   ├── concepts/     # YAML files for climate concepts
│   ├── sessions/     # Interview session data (JSON)
│   └── topics.yaml   # Topic definitions
└── package.json      # Root package.json with dev scripts
```

## Available Scripts

| Command          | Description                              |
|------------------|------------------------------------------|
| `npm run dev`    | Run both server and client concurrently  |
| `npm run server` | Run only the backend server              |
| `npm run client` | Run only the frontend dev server         |
