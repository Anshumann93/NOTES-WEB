/**
 * STARTER DATA & PRELOADED EXAMPLES FOR TUBESHELL
 */

export const PRELOADED_URL_EXAMPLES = [
  {
    id: "example-youtube-1",
    label: "Example 1: YouTube Video Talk",
    tag: "YouTube",
    title: "System Architecture & Scalable Microservices",
    url: "https://www.youtube.com/watch?v=M6k98f244_Y",
    domain: "youtube.com",
    channel: "TechSummit Global",
    duration: "42:15",
    thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80",
    summary: "Comprehensive deep dive into building event-driven microservices, decoupling high-throughput services with message brokers, and implementing distributed circuit breakers for zero-downtime resilience.",
    takeaways: [
      "Event Sourcing vs CDC (Change Data Capture) architectures",
      "Handling race conditions in distributed transactions with the Saga Pattern",
      "Designing fault-tolerant circuit breakers with 99.99% SLA metrics",
      "Optimizing database connection pooling across Kubernetes pods"
    ],
    mindmapId: "mm-system-architecture",
    flowchartId: "flow-microservices-sync"
  },
  {
    id: "example-doc-2",
    label: "Example 2: Web Docs Reference",
    tag: "Web Docs",
    title: "MDN: Modern Web Performance & Core Vitals",
    url: "https://developer.mozilla.org/en-US/docs/Web/Performance",
    domain: "developer.mozilla.org",
    channel: "MDN Web Docs",
    duration: "12 min read",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
    summary: "Official reference guide to optimizing Largest Contentful Paint (LCP), Interaction to Next Paint (INP), and Cumulative Layout Shift (CLS) for state-of-the-art web performance.",
    takeaways: [
      "Prioritize critical CSS rendering path above-the-fold",
      "Offload long JavaScript execution to Web Workers",
      "Preload key font assets and optimize WebP/AVIF imagery",
      "Monitor real-user performance metrics (RUM) with PerformanceObserver"
    ],
    mindmapId: "mm-web-performance",
    flowchartId: "flow-lcp-optimization"
  }
];

export const STARTER_NOTES = [
  {
    id: "note-yt-1",
    type: "url_bookmark",
    sourceType: "youtube",
    title: "⚡ System Architecture & Scalable Microservices (YouTube Summary)",
    url: "https://www.youtube.com/watch?v=M6k98f244_Y",
    domain: "youtube.com",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80",
    content: "## 📺 YouTube Video Summary: System Architecture\n**Channel**: TechSummit Global | **Duration**: 42:15\n\n### 💡 Key Takeaways\n1. **Event-Driven Decoupling**: Isolate heavy transactional databases from read-heavy consumer feeds using Kafka/RabbitMQ.\n2. **Saga Pattern**: Manage distributed multi-service operations without locking table records across services.\n3. **Circuit Breakers**: Implement automatic fallbacks with 500ms trip threshold to prevent cascading cluster outages.\n\n```typescript\n// Circuit breaker retry wrapper\nasync function executeWithFallback<T>(fn: () => Promise<T>, fallback: T): Promise<T> {\n  try {\n    return await fn();\n  } catch (err) {\n    console.warn('Circuit tripped, executing fallback', err);\n    return fallback;\n  }\n}\n```",
    category: "work",
    color: "indigo",
    isPinned: true,
    isArchived: false,
    isTrash: false,
    tags: ["YouTube", "Architecture", "Microservices", "SystemDesign"],
    mindmapData: {
      id: "mm-system-architecture",
      title: "⚡ Scalable Microservices Architecture",
      color: "indigo",
      x: 380,
      y: 240,
      children: [
        {
          id: "mm-sa-1",
          title: "📨 Event Streaming",
          color: "purple",
          x: 140,
          y: 120,
          expanded: true,
          children: [
            { id: "mm-sa-1-1", title: "Kafka Event Log", color: "purple", x: 40, y: 80 },
            { id: "mm-sa-1-2", title: "RabbitMQ Dead Letter", color: "purple", x: 40, y: 150 }
          ]
        },
        {
          id: "mm-sa-2",
          title: "🛡️ Resiliency & Fallbacks",
          color: "cyan",
          x: 640,
          y: 120,
          expanded: true,
          children: [
            { id: "mm-sa-2-1", title: "Circuit Breakers (500ms)", color: "cyan", x: 800, y: 80 },
            { id: "mm-sa-2-2", title: "Distributed Sagas", color: "cyan", x: 800, y: 150 }
          ]
        },
        {
          id: "mm-sa-3",
          title: "📊 Observability & Metrics",
          color: "emerald",
          x: 380,
          y: 400,
          expanded: true,
          children: [
            { id: "mm-sa-3-1", title: "OpenTelemetry Traces", color: "emerald", x: 200, y: 460 },
            { id: "mm-sa-3-2", title: "Prometheus 99.99% SLA", color: "emerald", x: 540, y: 460 }
          ]
        }
      ]
    },
    flowchartData: {
      id: "flow-microservices-sync",
      title: "Microservices Event Processing & Resiliency Flow",
      nodes: [
        { id: "fn-1", step: "Step 1", title: "User Request Dispatched", type: "terminal", x: 40, y: 100, desc: "API Gateway validates JWT token" },
        { id: "fn-2", step: "Step 2", title: "Event Published to Bus", type: "process", x: 260, y: 100, desc: "Serialized JSON payload to Kafka cluster" },
        { id: "fn-3", step: "Step 3", title: "Consumer Healthy?", type: "decision", x: 480, y: 90, desc: "Health check & heartbeat response < 200ms" },
        { id: "fn-4", step: "Step 3b", title: "Route to Dead Letter Queue", type: "process", x: 480, y: 260, desc: "Alert DevOps and retry after backoff" },
        { id: "fn-5", step: "Step 4", title: "Database Write & Cache", type: "process", x: 720, y: 100, desc: "Postgres write + Redis cache invalidation" },
        { id: "fn-6", step: "Step 5", title: "Ack Confirmed (200 OK)", type: "success", x: 940, y: 100, desc: "Response sent back to client" }
      ],
      connections: [
        { from: "fn-1", to: "fn-2", label: "Route" },
        { from: "fn-2", to: "fn-3", label: "Publish" },
        { from: "fn-3", to: "fn-5", label: "Healthy (Yes)" },
        { from: "fn-3", to: "fn-4", label: "Timeout (No)" },
        { from: "fn-4", to: "fn-5", label: "On Auto-Retry" },
        { from: "fn-5", to: "fn-6", label: "Success" }
      ]
    },
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString()
  },
  {
    id: "note-doc-2",
    type: "checklist",
    sourceType: "web_doc",
    title: "🚀 Web Performance & Core Vitals Action Plan (MDN)",
    url: "https://developer.mozilla.org/en-US/docs/Web/Performance",
    domain: "developer.mozilla.org",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
    content: "Actionable checklist derived from MDN Performance guidelines:",
    checklist: [
      { id: "task-1", text: "Minify and inline critical viewport CSS", completed: true },
      { id: "task-2", text: "Convert raster images to next-gen AVIF/WebP", completed: true },
      { id: "task-3", text: "Eliminate render-blocking JavaScript scripts", completed: true },
      { id: "task-4", text: "Audit third-party tags using PerformanceObserver", completed: false },
      { id: "task-5", text: "Achieve 95+ score on Google Lighthouse Audit", completed: false }
    ],
    category: "tasks",
    color: "emerald",
    isPinned: true,
    isArchived: false,
    isTrash: false,
    tags: ["WebDocs", "Performance", "Lighthouse", "CoreVitals"],
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: "note-idea-3",
    type: "note",
    sourceType: "custom",
    title: "💡 TubeShell AI Generation Features & Vision",
    content: "- **YouTube Transcript OCR**: Parse audio transcripts and key slide frames into actionable markdown.\n- **Mindmap Branch Synthesizer**: Automatically structure hierarchic concepts into interactive nodes.\n- **Workflow Flowchart Synthesis**: Turn step-by-step logic into visual signal pathways.\n- **Local-First & Offline First**: Zero latency with seamless cloud sync backend integration.",
    category: "ideas",
    color: "purple",
    isPinned: false,
    isArchived: false,
    isTrash: false,
    tags: ["TubeShell", "ProductVision", "AI", "Mindmaps"],
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

export const STARTER_STATS = {
  totalNotes: 8,
  urlsProcessed: 14,
  mindmapsCreated: 5,
  flowchartsCreated: 4,
  tasksCompletedRate: 78,
  weeklyStreak: [
    { day: "Mon", count: 4 },
    { day: "Tue", count: 7 },
    { day: "Wed", count: 5 },
    { day: "Thu", count: 9 },
    { day: "Fri", count: 12 },
    { day: "Sat", count: 8 },
    { day: "Sun", count: 6 }
  ]
};
