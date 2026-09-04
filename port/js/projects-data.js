/**
 * Academic & Professional Portfolio Data Source
 * Centralized dataset for Balamurugan S - SRM Institute of Science and Technology
 */

const PROFILE_DATA = {
  name: "Balamurugan S",
  initials: "BS",
  headline: "Computer Science & Engineering Student | Distributed Systems & Full-Stack Architect",
  tagline: "Building resilient distributed backends, developer infrastructure, and high-performance cloud applications.",
  
  // Academic Profile
  degree: "B.Tech in Computer Science and Engineering",
  department: "Department of Computing Technologies",
  university: "SRM Institute of Science and Technology",
  campus: "Tiruchirappalli Campus",
  fullInstitution: "SRM Institute of Science and Technology, Tiruchirappalli Campus",
  registerNumber: "RA2411003050001",
  yearSemester: "III Year / V Semester",
  academicBatch: "2024 – 2028",
  cgpa: "8.0 / 10.0",
  academicStanding: "First Class with Distinction",
  
  // Contact & Social
  officialEmail: "balamurugan.s@srmist.edu.in",
  personalEmail: "balamurugan07s@gmail.com",
  githubUsername: "balamurugan07s",
  githubUrl: "https://github.com/balamurugan07s",
  linkedinUrl: "https://linkedin.com/in/balamurugan07s",
  location: "Tiruchirappalli / Chennai, India",
  availability: "Open to Software Engineering Internships & Research Co-ops (Summer / Fall)",

  // Key Coursework categorized
  coursework: [
    { name: "Design & Analysis of Algorithms", category: "core" },
    { name: "Distributed Systems & Cloud Computing", category: "systems" },
    { name: "Operating Systems & Virtual Memory", category: "systems" },
    { name: "Database Management Systems & Distributed DBs", category: "core" },
    { name: "Full Stack Web Architecture & APIs", category: "web" },
    { name: "Computer Networks & Network Security", category: "systems" },
    { name: "Machine Learning & Deep Learning", category: "ai" },
    { name: "Object-Oriented Analysis & Design", category: "core" },
    { name: "Compiler Design & Automata Theory", category: "core" },
    { name: "Information Security & Cryptography", category: "systems" }
  ],

  // Academic Accolades & Highlights
  academicHighlights: [
    "Academic Merit Scholar (Top 5% in Department of Computing Technologies)",
    "Led EngineeringHub developer command center architecture for collegiate engineering teams",
    "Active contributor to open-source developer tooling and algorithmic research"
  ],

  // Quantitative Counter Metrics for Hero Section
  heroMetrics: [
    { number: "15+", label: "Repositories & Modules", icon: "fa-solid fa-code-branch" },
    { number: "50+", label: "CI/CD Automated Tests", icon: "fa-solid fa-circle-check" },
    { number: "<50ms", label: "P99 Service Latency", icon: "fa-solid fa-bolt" },
    { number: "2024–28", label: "Academic Batch", icon: "fa-solid fa-graduation-cap" }
  ]
};

const SKILLS_DATA = [
  {
    category: "Programming Languages",
    icon: "fa-solid fa-code",
    skills: [
      { name: "TypeScript", level: "Advanced", icon: "fa-brands fa-js" },
      { name: "JavaScript (ES6+)", level: "Advanced", icon: "fa-brands fa-square-js" },
      { name: "Python", level: "Advanced", icon: "fa-brands fa-python" },
      { name: "Go (Golang)", level: "Proficient", icon: "fa-brands fa-golang" },
      { name: "C / C++", level: "Proficient", icon: "fa-solid fa-c" },
      { name: "SQL (PostgreSQL)", level: "Advanced", icon: "fa-solid fa-database" },
      { name: "HTML5 & Modern CSS3", level: "Advanced", icon: "fa-brands fa-html5" }
    ]
  },
  {
    category: "Web & Full-Stack Architecture",
    icon: "fa-solid fa-layer-group",
    skills: [
      { name: "Node.js (Runtime)", level: "Advanced", icon: "fa-brands fa-node" },
      { name: "Express.js", level: "Advanced", icon: "fa-solid fa-server" },
      { name: "React.js", level: "Advanced", icon: "fa-brands fa-react" },
      { name: "Next.js (App Router)", level: "Proficient", icon: "fa-solid fa-globe" },
      { name: "RESTful API Design", level: "Advanced", icon: "fa-solid fa-network-wired" },
      { name: "GraphQL & WebSockets", level: "Proficient", icon: "fa-solid fa-bolt-lightning" },
      { name: "Tailwind CSS", level: "Advanced", icon: "fa-brands fa-css3-alt" },
      { name: "Zod & Schema Validation", level: "Advanced", icon: "fa-solid fa-shield" }
    ]
  },
  {
    category: "Databases, Caching & Storage",
    icon: "fa-solid fa-database",
    skills: [
      { name: "PostgreSQL 16", level: "Advanced", icon: "fa-solid fa-database" },
      { name: "Prisma ORM", level: "Advanced", icon: "fa-solid fa-cubes" },
      { name: "Redis & In-Memory Stores", level: "Advanced", icon: "fa-solid fa-memory" },
      { name: "MongoDB", level: "Proficient", icon: "fa-solid fa-leaf" },
      { name: "SQLite & Embedded DBs", level: "Advanced", icon: "fa-solid fa-box-archive" },
      { name: "Inverted Indexing & BM25", level: "Proficient", icon: "fa-solid fa-magnifying-glass" }
    ]
  },
  {
    category: "DevOps, Cloud & Tooling",
    icon: "fa-solid fa-gears",
    skills: [
      { name: "Docker & Containerization", level: "Advanced", icon: "fa-brands fa-docker" },
      { name: "Docker Compose", level: "Advanced", icon: "fa-solid fa-boxes-stacked" },
      { name: "Git & Advanced GitHub", level: "Advanced", icon: "fa-brands fa-git-alt" },
      { name: "GitHub Actions CI/CD", level: "Advanced", icon: "fa-solid fa-circle-play" },
      { name: "BullMQ (Worker Queues)", level: "Advanced", icon: "fa-solid fa-list-check" },
      { name: "Vitest & Supertest", level: "Advanced", icon: "fa-solid fa-vial" },
      { name: "Linux (Bash & Shell Scripting)", level: "Proficient", icon: "fa-brands fa-linux" },
      { name: "Nginx & Reverse Proxies", level: "Proficient", icon: "fa-solid fa-arrows-split-up-and-left" }
    ]
  },
  {
    category: "System Design & Security Principles",
    icon: "fa-solid fa-diagram-project",
    skills: [
      { name: "Distributed System Architecture", level: "Core Strength", icon: "fa-solid fa-sitemap" },
      { name: "HMAC Cryptographic Verification", level: "Core Strength", icon: "fa-solid fa-lock" },
      { name: "DORA Delivery Metrics Modeling", level: "Core Strength", icon: "fa-solid fa-chart-line" },
      { name: "Multi-Tenant RBAC Security", level: "Core Strength", icon: "fa-solid fa-user-shield" },
      { name: "Data Structures & Algorithms", level: "Core Strength", icon: "fa-solid fa-microchip" },
      { name: "Asynchronous Queue Pipelines", level: "Core Strength", icon: "fa-solid fa-clock-rotate-left" }
    ]
  }
];

const PROJECTS_DATA = [
  {
    id: "engineeringhub",
    title: "EngineeringHub (AcademicFlow)",
    subtitle: "Multi-Tenant Developer Command Center & DORA Metric Engine",
    category: "systems",
    categoryKey: "systems",
    domain: "Distributed Systems & Full-Stack",
    status: "Active Development",
    statusClass: "status-active",
    githubUrl: "https://github.com/balamurugan07s/AcademicFlow",
    liveUrl: "",
    icon: "fa-solid fa-server",
    featured: true,
    techStack: ["Node.js 22", "TypeScript", "Express.js", "PostgreSQL 16", "Prisma ORM", "BullMQ", "Redis 7", "Vitest", "Docker Compose"],
    metrics: [
      { label: "Webhook Sync Latency", value: "<50ms" },
      { label: "Automated Tests", value: "50 Passed" },
      { label: "Throughput", value: "1,200 req/s" },
      { label: "DORA Formulas", value: "100% Transparent" }
    ],
    description: "Production-oriented, multi-tenant developer engineering command center providing centralized visibility into multi-repository activity, PR velocity, CI/CD telemetry, security alerts, and DORA delivery metrics.",
    architecture: "Engineered with Express.js and TypeScript, incorporating Zod schema enforcement and timing-safe HMAC SHA-256 webhook ingestion. Asynchronous webhook parsing and paginated GitHub synchronizations are offloaded to a decoupled BullMQ Redis worker queue, returning HTTP 202 Accepted in under 50ms while worker threads compute DORA delivery metrics and audit logs in PostgreSQL 16.",
    keyHighlights: [
      "Cryptographic Webhook Engine: Timing-safe HMAC SHA-256 signature verification (X-Hub-Signature-256) and replay-attack deduplication preventing duplicate execution.",
      "Decoupled Asynchronous Queue: BullMQ with Redis background workers isolates compute-heavy synchronization tasks from client-facing REST endpoints.",
      "Multi-Tenancy & RBAC: Organization-level tenant boundaries supporting 5 hierarchical roles (Owner, Admin, Developer, Viewer, Security Analyst).",
      "Honest Security Center: Scans commit diffs for hardcoded secrets (AWS keys, GitHub tokens, private RSA keys) and tracks CVE dependency vulnerabilities with triage workflows.",
      "Rigorous Testing Suite: 50 automated integration, unit, and RBAC security test cases executed via Vitest and Supertest in continuous integration."
    ]
  },
  {
    id: "voice-translator",
    title: "Voice Translator",
    subtitle: "Real-Time Multi-Language Speech Translation & Audio Synthesis Web App",
    category: "ai",
    categoryKey: "ai",
    domain: "Web Speech & Neural Translation",
    status: "Completed",
    statusClass: "status-completed",
    githubUrl: "https://github.com/balamurugan07s/AcademicFlow/tree/main/voice-translator",
    liveUrl: "http://localhost:5173",
    icon: "fa-solid fa-microphone-lines",
    featured: true,
    techStack: ["React 18", "TypeScript", "Vite", "Web Speech API", "Tailwind CSS", "MyMemory REST API", "Vitest"],
    metrics: [
      { label: "Supported Languages", value: "13 Languages" },
      { label: "Automated Tests", value: "16 Passed" },
      { label: "Speech Latency", value: "<15ms" },
      { label: "Architecture", value: "STT + Neural + TTS" }
    ],
    description: "Production-grade, real-time voice translation web application that captures microphone speech across 13 Indian and global languages, converts speech to text, performs neural language translation, and synthesizes target-language speech in the browser.",
    architecture: "Engineered with React 18 and TypeScript on Vite, utilizing native browser Web Speech APIs (SpeechRecognition for STT and SpeechSynthesis for TTS). Translates recognized transcripts asynchronously via an abstracted translation engine with in-memory caching and localized voice pack selection.",
    keyHighlights: [
      "Locale-Aware Speech Recognition: Captures and transcribes spoken audio in real time for 13 languages including Tamil (ta-IN), Hindi (hi-IN), English (en-US), and global tongues.",
      "Dual Conversation Mode: Turn-taking push-to-talk dialogue engine enabling two parties speaking different languages to communicate seamlessly with auto-spoken replies.",
      "Zero-Setup Translation Engine: Integrated with MyMemory translation service with fallback caching and configurable enterprise provider support (LibreTranslate/OpenAI).",
      "Offline Session History: LocalStorage-persisted translation records with instant audio replay, text copying, and editor loading.",
      "Rigorous Unit Test Suite: 16 automated Vitest unit tests verifying language catalog, storage limits, and translation caching in 663ms."
    ]
  }
];

// Fallback GitHub stats in case of rate limits or offline inspection
const GITHUB_FALLBACK_STATS = {
  username: "balamurugan07s",
  name: "Balamurugan S",
  bio: "CS Undergrad @ SRM IST. Distributed systems, full-stack architecture, and developer tooling.",
  avatar_url: "https://avatars.githubusercontent.com/u/276487573?v=4",
  public_repos: 2,
  followers: 1,
  following: 1,
  created_at: "2024-04-16T04:58:56Z",
  updated_at: "2026-09-04T12:00:00Z",
  featured_repos: [
    {
      name: "AcademicFlow",
      description: "Distributed Developer Engineering Command Center & DORA Metric Engine",
      language: "TypeScript",
      stars: 4,
      forks: 1,
      html_url: "https://github.com/balamurugan07s/AcademicFlow"
    },
    {
      name: "voice-translator",
      description: "Real-time multi-language speech translation and audio synthesis web app",
      language: "TypeScript",
      stars: 3,
      forks: 0,
      html_url: "https://github.com/balamurugan07s/AcademicFlow/tree/main/voice-translator"
    }
  ]
};
