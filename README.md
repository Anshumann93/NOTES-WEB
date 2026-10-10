# StudyShell — AI-Powered Notes Generator

> Transform YouTube videos into structured study material: notes, flashcards, mind maps, and flowcharts. Generation runs directly in the authenticated API request and saves results to MongoDB.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Diagram](#2-architecture-diagram)
3. [Tech Stack](#3-tech-stack)
4. [Frontend Architecture](#4-frontend-architecture)
5. [Backend Architecture](#5-backend-architecture)
6. [Authentication Flow](#6-authentication-flow)
7. [YouTube → AI → MongoDB Pipeline](#7-youtube--transcript--ai--mongodb-pipeline)
8. [Generation Processing](#8-generation-processing)
9. [API Documentation](#9-api-documentation)
10. [Environment Variables](#10-environment-variables)
11. [Local Setup](#11-local-setup)
12. [Production Deployment Considerations](#12-production-deployment-considerations)

---

## 1. Project Overview

StudyShell is a full-stack, production-grade notes application where users paste a YouTube URL and receive fully-structured AI-generated study material:

- **Summarized notes** in rich Markdown
- **Interactive flashcards** for spaced-repetition
- **Draggable mind maps** with SVG canvas
- **Animated flowcharts** for workflow visualization

YouTube transcript extraction and AI generation run with `async/await` inside the authenticated Express request. The API returns the completed note in its standard response envelope; the frontend shows a loading state and allows up to five minutes for generation.

---

## 2. Architecture Diagram

```mermaid
graph TD
    subgraph Browser ["🌐 React Frontend (Vite)"]
        UI["UI Components"]
        AuthCtx["AuthContext\n(JWT Cookie)"]
        NotesCtx["NotesContext\n(State)"]
        AISvc["aiGeneratorService\n(direct request)"]
        NotesSvc["notesService\n(CRUD)"]
    end

    subgraph Backend ["⚙️ Node.js + Express Backend"]
        AuthRoutes["/api/auth/*\nRegister / Login / Logout / Refresh"]
        NoteRoutes["/api/notes/*\nCRUD + Generate + Status"]
        DashRoutes["/api/dashboard/stats\nAggregation"]

        AuthMW["verifyJWT Middleware"]
        RateLimit["Rate Limiter\n(200 req / 15min\n30 gen / 1hr)"]
        Helmet["Helmet + Mongo\nSanitize"]

        AuthCtrl["Auth Controller"]
        NoteCtrl["Note Controller"]
        GenCtrl["Generator Controller"]

        AuthSvc["AuthService\n(bcrypt, JWT)"]
        NoteSvc["NoteService\n(Ownership checks)"]
        GenSvc["GeneratorService\n(Direct async pipeline)"]
        YTSvc["YouTubeService\n(Metadata + Transcript)"]
        AISvcB["AIService\n(Provider Abstraction)"]
    end

    subgraph DB ["🍃 MongoDB Atlas"]
        UserCollection["users collection"]
        NoteCollection["notes collection\n(Compound Indexes)"]
    end

    Browser -->|"HTTPS + Cookie"| Backend
    AuthCtx -->|"POST /api/auth/login"| AuthRoutes
    NotesCtx -->|"GET /api/notes"| NoteRoutes
    AISvc -->|"POST /api/notes/generate"| NoteRoutes

    NoteRoutes --> AuthMW --> NoteCtrl
    AuthRoutes --> AuthCtrl
    DashRoutes --> AuthMW

    AuthCtrl --> AuthSvc --> UserCollection
    NoteCtrl --> NoteSvc --> NoteCollection
    GenCtrl --> GenSvc
    GenSvc --> YTSvc
    GenSvc --> AISvcB
    GenSvc --> NoteCollection
```

---

## 3. Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Vanilla CSS |
| **State Management** | React Context API |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **Auth** | JWT (access + refresh), bcrypt |
| **Generation** | Direct asynchronous service calls |
| **Security** | Helmet, express-rate-limit, express-mongo-sanitize |
| **AI Abstraction** | Isolated `ai.service.js` (swap any LLM) |

---

## 4. Frontend Architecture

```
Frontend/
└── src/
    ├── services/
    │   ├── api.js                  # Core fetch wrapper (credentials: 'include')
    │   ├── notesService.js         # CRUD, dashboard, status API calls
    │   └── aiGeneratorService.js   # Direct YouTube generation request
    ├── context/
    │   ├── AuthContext.jsx         # User session, login, logout, register
    │   ├── NotesContext.jsx        # Global notes state + generation loading state
    │   └── ThemeContext.jsx        # Dark/light mode toggle
    ├── components/
    │   ├── Auth.jsx                # Login / Register screen (glassmorphic)
    │   ├── Navbar.jsx              # Navigation + user name + logout button
    │   ├── Dashboard.jsx           # Stats cards + generation history
    │   ├── UrlGenerator.jsx        # URL input + AI trigger
    │   ├── NotesGrid.jsx           # Paginated note grid with filters
    │   ├── MindmapViewer.jsx       # Interactive SVG mind map (pan/zoom)
    │   ├── FlowchartViewer.jsx     # Animated flowchart visualization
    │   └── NoteEditorModal.jsx     # Full note editor / checklist
    └── App.jsx                     # Root: AuthProvider > NotesProvider > AppContent
```

### Key Data Flow

1. `App.jsx` wraps children in `AuthProvider` → `NotesProvider`.
2. On mount, `AuthContext` calls `GET /api/auth/me`. If cookie is valid → user is set. If not → `<Auth />` component is shown (protected gate).
3. Once authenticated, `NotesContext` loads the user's notes from the backend.
4. The generator waits for the completed note response; if the client times out, the saved status can still be checked at `GET /api/notes/:id/status`.

---

## 5. Backend Architecture

```
Backend/src/
├── config/
│   ├── db.js           # Mongoose connection
├── controllers/
│   ├── auth.controller.js
│   ├── note.controller.js
│   ├── generator.controller.js
│   └── dashboard.controller.js
├── services/
│   ├── auth.service.js         # bcrypt hashing, JWT generation
│   ├── note.service.js         # Ownership-safe CRUD + pagination
│   ├── generator.service.js    # Pipeline orchestrator
│   ├── youtube.service.js      # Metadata + transcript extraction
│   ├── ai.service.js           # LLM provider abstraction layer
│   └── dashboard.service.js    # MongoDB $facet aggregation
├── models/
│   ├── user.model.js   # bcrypt methods, JWT methods
│   └── note.model.js   # Status, compound indexes
├── middlewares/
│   └── auth.middleware.js   # verifyJWT (cookie + Bearer)
├── routes/
│   ├── auth.routes.js
│   ├── note.routes.js
│   └── dashboard.routes.js
└── utils/
    ├── ApiError.js      # Standardized error class
    ├── ApiResponse.js   # Standardized response class
    └── asyncHandler.js  # try/catch wrapper for async controllers
```

**Design principle:** Controllers are thin — they only parse the request and call a Service. All business logic lives in Services.

---

## 6. Authentication Flow

```
Register:  POST /api/auth/register  → hash password with bcrypt → save User
Login:     POST /api/auth/login     → verify bcrypt → issue accessToken + refreshToken
                                    → Set-Cookie: accessToken (httpOnly, sameSite: strict)
                                    → Set-Cookie: refreshToken (httpOnly, sameSite: strict)

Protected: Every request →  verifyJWT middleware reads cookie or Authorization header
                         →  jwt.verify(token, ACCESS_TOKEN_SECRET)
                         →  User.findById(decoded._id).select('-password')
                         →  Attaches req.user → passes to controller

Refresh:   POST /api/auth/refresh   → reads refreshToken cookie → issues new pair
Logout:    POST /api/auth/logout    → clears both cookies via res.clearCookie()
```

**Key security properties:**
- Refresh token is stored in an `httpOnly`, `sameSite: strict` cookie — inaccessible to JavaScript
- Passwords are never returned in API responses (`.select('-password')` enforced)
- Access tokens expire independently; refresh tokens allow seamless re-authentication

---

## 7. YouTube → Transcript → AI → MongoDB Pipeline

```
POST /api/notes/generate  (authenticated; waits for completion)
    │
    ▼
GeneratorService.generateFromUrl()
    │  ├─ Extract videoId from URL
    │  ├─ Create an owned Note { status: 'pending' } in MongoDB
    │  └─ Execute the generation pipeline directly
    │
    ▼
GeneratorService.executeGenerationJob(noteId, url, userId)
    │
    ├─ Note.findByIdAndUpdate → status: 'processing'
    │
    ├─ YouTubeService.getVideoInfo()      → title, thumbnail, duration
    ├─ YouTubeService.getTranscript()     → raw timestamped transcript
    │
    ├─ cleanTranscript()                  → strip timestamps, filler words
    ├─ chunkTranscript()                  → split into AI-safe context windows
    ├─ processChunks()                    → combine chunk summaries
    │
    ├─ aiService.generateStudyMaterials() → summary, notes, flashcards,
    │                                        mind map, flowchart, checklist
    │
    └─ Note.findByIdAndUpdate → status: 'completed' + all generated fields
         OR on error → status: 'failed', error: err.message
```

**AIService is provider-agnostic.** To switch from OpenAI to Gemini or Claude, only `ai.service.js` needs editing.

---

## 8. Generation Processing

The API creates a pending note, updates it to `processing`, then awaits YouTube metadata, transcript extraction, AI generation, and the final MongoDB update. Failures are recorded on the note as `failed` and returned through the normal API error middleware. No separate job system or worker process is required.

---

## 9. API Documentation

### Auth Routes (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | ❌ | Create new user account |
| `POST` | `/login` | ❌ | Login and receive session cookies |
| `POST` | `/logout` | ✅ | Clear session cookies |
| `POST` | `/refresh` | ❌ | Refresh access token from cookie |
| `GET` | `/me` | ✅ | Get currently authenticated user |

### Notes Routes (`/api/notes`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/generate` | ✅ | Generate and return a completed YouTube note |
| `GET` | `/` | ✅ | Get all user notes (paginated) |
| `GET` | `/:id` | ✅ | Get a single note (ownership enforced) |
| `PUT` | `/:id` | ✅ | Update a note (ownership enforced) |
| `DELETE` | `/:id` | ✅ | Soft-delete (or `?permanent=true` for hard delete) |
| `GET` | `/:id/status` | ✅ | Poll processing status (`pending/processing/completed/failed`) |

### Dashboard Routes (`/api/dashboard`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/stats` | ✅ | Aggregated user productivity statistics |

### Standard Response Shape

All responses follow this envelope:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Human-readable message",
  "data": { }
}
```

---

## 10. Environment Variables

### Backend (`Backend/.env`)

Copy `Backend/.env.example` to `Backend/.env` and configure:

| Variable | Required | Purpose |
|---|---|---|
| `PORT` | No | API port (defaults to 5000) |
| `MONGODB_URI` | Yes | Local MongoDB or Atlas connection string |
| `CORS_ORIGIN` | Yes | Exact frontend origin, e.g. `http://localhost:5173` |
| `ACCESS_TOKEN_SECRET` | Yes | Secret used to sign access JWTs |
| `ACCESS_TOKEN_EXPIRY` | No | Access token lifetime |
| `REFRESH_TOKEN_SECRET` | Yes | Separate secret used to sign refresh JWTs |
| `REFRESH_TOKEN_EXPIRY` | No | Refresh token lifetime |
| `AI_PROVIDER` | Yes | `gemini`, `openai`, or `groq` |
| `GEMINI_API_KEY`, `OPENAI_API_KEY`, `GROQ_API_KEY` | One required | Key for the selected AI provider |
| `GEMINI_MODEL`, `OPENAI_MODEL`, `GROQ_MODEL` | No | Provider-specific model overrides |

Keep actual keys and database credentials only in ignored `.env` files; never put them in frontend variables.

### Frontend (`Frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

> **⚠️ Security:** Never commit `.env` files. Both are already in `.gitignore`. Never expose `ACCESS_TOKEN_SECRET`, AI keys, or database URIs to the React client.

---

## 11. Local Setup

### Prerequisites

| Tool | Minimum Version |
|------|----------------|
| Node.js | v18+ |
| npm | v9+ |
| MongoDB | Local or Atlas cluster |

---

### MongoDB Setup

**Option A — Local:**
```bash
# macOS (Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Windows: Install MongoDB Community Server from mongodb.com/try/download/community
# Then start: net start MongoDB
```

**Option B — Atlas (Cloud, recommended for production):**
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free M0 cluster
3. Create a database user and whitelist your IP
4. Copy the connection string into `MONGODB_URI`

---

### Running the Backend

```bash
cd "NOTES APP/Backend"
npm install
cp .env.example .env      # fill in your values
npm run dev               # starts server on port 5000
```

The backend connects to MongoDB before listening. Generation runs in the API process; no separate worker process is needed.

---

### Running the Frontend

```bash
cd "NOTES APP/Frontend"
npm install
cp .env.example .env      # set VITE_API_BASE_URL
npm run dev               # starts Vite on port 5173
```

Open [http://localhost:5173](http://localhost:5173)

---

## 12. Production Deployment Considerations

### Security Hardening
- [ ] Set `NODE_ENV=production` — enables secure cookies and hides stack traces
- [ ] Use strong, unique 64-char secrets for `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET`
- [ ] Set `CORS_ORIGIN` to your exact production frontend domain only
- [ ] Add `sameSite: 'strict'` + `secure: true` to cookies (already done when `NODE_ENV=production`)
- [ ] Rotate all secrets immediately if they are ever exposed

### Scalability
- [ ] Use **MongoDB Atlas** with connection pooling for the production database
- [ ] Account for the longer generation request duration in reverse-proxy and hosting timeouts

### Infrastructure
- [ ] Use a process manager like **PM2** for zero-downtime restarts: `pm2 start server.js`
- [ ] Put the Express server behind **Nginx** or a cloud load balancer
- [ ] Enable **HTTPS/TLS** — required for `secure: true` cookies to work
- [ ] Set up **MongoDB Atlas backups** on a scheduled policy
- [ ] Add **health check endpoint** (`GET /healthz`) for load balancer probes

### Monitoring
- [ ] Set up error alerting (Sentry, Datadog) for generation and provider failures
- [ ] Add **structured logging** (e.g., Winston + CloudWatch) — never log passwords, tokens, or PII

### Frontend
- [ ] Build with `npm run build` and serve the `/dist` folder via Nginx or a CDN
- [ ] Set `VITE_API_BASE_URL` to your production API domain (e.g., `https://api.studyshell.com/api`)
- [ ] Configure **cache headers** for the Vite build output (fingerprinted filenames make long-term caching safe)
