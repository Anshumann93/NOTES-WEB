# Walkthrough: StudyShell Notes Generator (React.js)

The **StudyShell Notes Generator** web application has been built from scratch in modern **React.js + Vite** with modular architecture, descent animations, dark/light theme switching, and easy-to-recognize backend connection points.

---

## 🌟 Key Features Implemented

### 1. StudyShell Brand Identity & Dual Theme
- **Custom StudyShell Logo** ([StudyShellLogo.jsx](file:///c:/Users/ASUS/OneDrive/Desktop/NOTES%20APP/Frontend/src/assets/StudyShellLogo.jsx)): Responsive glowing SVG shell/lightning icon with branding across the navigation bar, dashboard, and footer.
- **Theme Switcher** ([ThemeContext.jsx](file:///c:/Users/ASUS/OneDrive/Desktop/NOTES%20APP/Frontend/src/context/ThemeContext.jsx)): Fluid animated toggle between **Dark Mode** (Obsidian Glass `#080c14`) and **Light Mode** (Porcelain White `#f4f6fb`) with persistent `localStorage` memory.
- **Descent Animations** ([index.css](file:///c:/Users/ASUS/OneDrive/Desktop/NOTES%20APP/Frontend/src/index.css)): Staggered downward cascade physics (`@keyframes cardDescentIn`, `@keyframes descentFadeIn`, `@keyframes modalDropIn`).

### 2. "What StudyShell Can Do" Key Features Showcase
- [KeyFeatures.jsx](file:///c:/Users/ASUS/OneDrive/Desktop/NOTES%20APP/Frontend/src/components/KeyFeatures.jsx) displays interactive feature cards highlighting:
  - 🎥 **YouTube & Video Summarizer**
  - 🧠 **AI Mindmap Generator**
  - 🔀 **Workflow Flowchart Synthesizer**
  - ✅ **Actionable Checklist Extractor**
  - 🌐 **Rich OpenGraph URL Previews**
  - 📦 **Decoupled Backend API & Backup Sync**

### 3. User Dashboard & Generation History
- [Dashboard.jsx](file:///c:/Users/ASUS/OneDrive/Desktop/NOTES%20APP/Frontend/src/components/Dashboard.jsx) provides:
  - **Progress Metric Cards**: Total Notes Generated, URLs Processed, Mindmaps Built, Task Completion Rate (%).
  - **Generation History Timeline**: Interactive table of past notes filterable by type (*YouTube, Web Docs, Checklists, Visuals*), with instant search and direct action buttons (View, Mindmap, Flowchart, Delete).
  - **Backup Export**: One-click JSON backup export.

### 4. Interactive URL Generator & 2 Preloaded Examples
- [UrlGenerator.jsx](file:///c:/Users/ASUS/OneDrive/Desktop/NOTES%20APP/Frontend/src/components/UrlGenerator.jsx) includes:
  - **Input Bar**: For any YouTube video URL or article link.
  - **2 Preloaded One-Click Example Cards**:
    1. *Example 1 (YouTube)*: "System Architecture & Scalable Microservices" (generates Markdown Summary, Key Takeaways, Mindmap, and Flowchart).
    2. *Example 2 (MDN Web Doc)*: "MDN: Modern Web Performance & Core Vitals" (generates Checklist, Notes, and URL Preview).
  - **Animated 3-Step Progress Indicator**.

### 5. Interactive Mindmap & Flowchart Studios
- [MindmapViewer.jsx](file:///c:/Users/ASUS/OneDrive/Desktop/NOTES%20APP/Frontend/src/components/MindmapViewer.jsx): Interactive SVG/Canvas node visualizer with pan, zoom, collapsible branches, and "+ Add Subnode" prompt.
- [FlowchartViewer.jsx](file:///c:/Users/ASUS/OneDrive/Desktop/NOTES%20APP/Frontend/src/components/FlowchartViewer.jsx): Interactive step diagram with decision nodes, animated dashed SVG connectors, and a **"▶ Run Flow Simulation"** execution stepper.

---

## 🔌 Backend Connection Points (Easy Recognition)

All backend communication has been isolated in `src/services/` with clear integration markers:

| Service File | Purpose & Endpoints |
|---|---|
| [`src/services/api.js`](file:///c:/Users/ASUS/OneDrive/Desktop/NOTES%20APP/Frontend/src/services/api.js) | **Base Client**: Configures `VITE_API_BASE_URL` (from `.env`), handles Bearer auth tokens, and provides intelligent mock fallback when backend is offline. |
| [`src/services/aiGeneratorService.js`](file:///c:/Users/ASUS/OneDrive/Desktop/NOTES%20APP/Frontend/src/services/aiGeneratorService.js) | **AI Generation Hook**: `POST /api/generate/url` — sends URLs/transcripts to backend for note, mindmap, and flowchart synthesis. |
| [`src/services/notesService.js`](file:///c:/Users/ASUS/OneDrive/Desktop/NOTES%20APP/Frontend/src/services/notesService.js) | **Notes & Dashboard Hook**: `GET /api/notes`, `POST /api/notes`, `PUT /api/notes/:id`, `DELETE /api/notes/:id`, and `GET /api/dashboard/stats`. |

---

## 🏃 How to Run Locally

```bash
cd Frontend
npm install
npm run dev
```

To connect your backend in the future:
1. Create a `.env` file in `Frontend/` with `VITE_API_BASE_URL=http://localhost:5000/api`.
2. Connect your backend routes matching the endpoints in [`src/services/`](file:///c:/Users/ASUS/OneDrive/Desktop/NOTES%20APP/Frontend/src/services/).
