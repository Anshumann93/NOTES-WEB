# ⚡ TubeShell Notes Generator (React.js)

A state-of-the-art AI-powered Notes, Mindmaps & Flowchart Web Application built with **React.js + Vite**, featuring descent animations, dark/light theme switcher, progress dashboard, and decoupled backend integration points.

---

## 🚀 Quick Start

```bash
# 1. Navigate to Frontend directory
cd Frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

---

## 🌟 Backend Connection Points (Easy Recognition)

All backend communication is modularized inside `src/services/` so you can connect your complex backend logic effortlessly:

### 1. `src/services/api.js` (Base API Client)
- **Base URL Configuration**: Configured via `VITE_API_BASE_URL` in `.env` (defaults to `http://localhost:5000/api`).
- **Auth Tokens**: Automatically attaches `Bearer <token>` headers from `localStorage`.
- **Intelligent Fallback**: Gracefully falls back to client mock simulation if the backend is offline during development.

### 2. `src/services/aiGeneratorService.js` (AI URL & Video Generator)
- `POST /api/generate/url` -> Receives `{ url, options }` and returns structured note summaries, key takeaways, task checklists, mindmap hierarchy, and flowchart diagrams.

### 3. `src/services/notesService.js` (Notes & Dashboard Persistence)
- `GET /api/notes` -> Fetch user notes
- `POST /api/notes` -> Save / Create a note
- `PUT /api/notes/:id` -> Update a note
- `DELETE /api/notes/:id` -> Delete a note
- `GET /api/dashboard/stats` -> Fetch user activity metrics and generation history

---

## 📁 Project Structure

```
Frontend/
├── .env.example                # Backend API URL template
├── package.json                # React 18 + Vite dependencies
├── vite.config.js              # Vite bundler configuration
├── index.html                  # HTML entry with TubeShell branding
└── src/
    ├── main.jsx                # React DOM render entry
    ├── App.jsx                 # Main layout & tab router
    ├── index.css               # Design tokens, Dark/Light palettes & descent animations
    ├── assets/
    │   └── TubeShellLogo.jsx   # Custom TubeShell SVG Brand Logo
    ├── services/               # 🌟 BACKEND CONNECTION POINTS
    │   ├── api.js              # Base API client
    │   ├── aiGeneratorService.js # AI URL & YouTube note generation
    │   └── notesService.js     # Notes CRUD & Dashboard analytics
    ├── context/
    │   ├── ThemeContext.jsx    # Dark & Light mode switcher with persistence
    │   └── NotesContext.jsx    # Central application state & toast notifications
    ├── components/
    │   ├── Navbar.jsx          # TubeShell Logo, search, tabs, theme toggle
    │   ├── UrlGenerator.jsx    # URL/YouTube note generator + 2 preloaded examples
    │   ├── KeyFeatures.jsx     # "What TubeShell Can Do" feature showcase
    │   ├── Dashboard.jsx       # Metrics, activity streak & generation history
    │   ├── NotesGrid.jsx       # Staggered card grid & category filters
    │   ├── NoteCard.jsx        # Markdown notes & interactive checklists
    │   ├── UrlBookmarkCard.jsx # Rich OpenGraph URL previews
    │   ├── MindmapViewer.jsx   # Interactive SVG Mindmap canvas (pan, zoom, branch)
    │   ├── FlowchartViewer.jsx # Interactive Flowchart with animated signal simulation
    │   ├── NoteEditorModal.jsx # Full-featured note & checklist editor modal
    │   └── Toast.jsx           # Floating toast alerts with descent physics
    └── data/
        └── starterData.js      # 2 Preloaded examples & rich initial state
```
