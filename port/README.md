# Professional Developer & Academic Portfolio

> A minimalist, high-contrast, recruiter-ready personal and academic portfolio website for **Balamurugan S**, Computer Science & Engineering undergraduate at **SRM Institute of Science and Technology, Tiruchirappalli Campus**.

Built with semantic **HTML5**, modern **CSS3** (with dark/light themes and responsive grid layouts), and modular **vanilla JavaScript** with dynamic filtering, deep-dive architectural modals, and live GitHub telemetry.

---

## 📁 Project Architecture

```
port/
├── index.html              # Semantic HTML5 layout with high accessibility
├── css/
│   ├── style.css           # Modern CSS variables, flex/grid layouts, responsive breakpoints
│   └── animations.css      # Hardware-accelerated UI transitions, modal animations, pulse dots
├── js/
│   ├── projects-data.js    # Centralized dataset: Profile info, coursework, skills, and projects
│   ├── main.js             # Interaction engine: Theme toggle, real-time search, filtering, and modal
│   └── github-stats.js     # Live GitHub REST API fetcher with graceful offline/rate-limit fallback
└── README.md               # Quickstart guide & deployment instructions
```

---

## ⚡ Quickstart & Local Preview

This portfolio has **zero build dependencies** or package installation requirements. You can run it immediately with any static server or open `index.html` directly in your browser.

### Option 1: Python HTTP Server (Recommended)
```bash
# Navigate to the portfolio folder
cd port

# Start local server on port 8000
python -m http.server 8000
```
Open [http://localhost:8000](http://localhost:8000) in your browser.

### Option 2: Node.js `npx serve`
```bash
cd port
npx serve .
```

### Option 3: VS Code Live Server
Right-click `port/index.html` inside VS Code and click **"Open with Live Server"**.

---

## 🚀 Deployment to GitHub Pages

You can publish this portfolio to your free GitHub Pages site (`https://balamurugan07s.github.io`) in a few simple steps:

### Method A: Deploy as Dedicated User Page (`balamurugan07s.github.io`)

1. Create a repository on GitHub named **`balamurugan07s.github.io`**.
2. Push the contents of the `port/` directory directly to the `main` branch:
   ```bash
   cd port
   git init
   git remote add origin https://github.com/balamurugan07s/balamurugan07s.github.io.git
   git branch -M main
   git add .
   git commit -m "feat: initial release of developer & academic portfolio"
   git push -u origin main
   ```
3. In GitHub, go to **Settings > Pages**, set **Source** to `Deploy from a branch` and select `/ (root)` of the `main` branch.
4. Your site will be live at: **https://balamurugan07s.github.io**

### Method B: Deploy as a Subpath in an Existing Repository

If you keep the `port/` folder inside your repository:
1. Go to repository **Settings > Pages**.
2. Select GitHub Actions or branch deployment targeting `/port` (or configure a standard GitHub Actions Pages workflow).
3. The site will be live at: `https://balamurugan07s.github.io/port`

---

## ⚙️ Customization & Updating Projects

All content is managed through a single data file: [`js/projects-data.js`](js/projects-data.js).

### 1. Updating Academic & Personal Details
Edit `PROFILE_DATA` in `js/projects-data.js`:
```javascript
const PROFILE_DATA = {
  name: "Balamurugan S",
  registerNumber: "RA2411003050001",
  cgpa: "8.0 / 10.0",
  officialEmail: "balamurugan.s@srmist.edu.in",
  // ...
};
```

### 2. Adding New Projects
Append a new project object to the `PROJECTS_DATA` array in `js/projects-data.js`:
```javascript
{
  id: "my-new-project",
  title: "Distributed Task Broker",
  subtitle: "High-throughput message broker written in Go",
  category: "systems", // 'systems', 'web', or 'ai'
  domain: "Distributed Systems",
  status: "Completed",
  statusClass: "status-completed",
  githubUrl: "https://github.com/balamurugan07s/task-broker",
  icon: "fa-solid fa-server",
  techStack: ["Go", "gRPC", "Protocol Buffers", "Docker"],
  metrics: [
    { label: "Throughput", value: "85k msg/s" },
    { label: "P99 Latency", value: "<2.4ms" }
  ],
  description: "Detailed summary of the system problem and architecture.",
  architecture: "Technical explanation of data structures and networking.",
  keyHighlights: [
    "Key architectural achievement 1",
    "Key architectural achievement 2"
  ]
}
```
The search bar, category filters, metric pills, and deep-dive modals will update automatically without changing any HTML.

---

## 🛠️ Key Technical Features

- **High-Contrast Slate Aesthetic**: Professional software engineer aesthetic with slate surfaces, crisp borders, and electric indigo/cyan accents.
- **Theme Persistence**: Dark (default) and light themes with automatic `localStorage` synchronization and smooth transitions.
- **Interactive Deep-Dive Modals**: Accessible popup dialogs showcasing architectural decisions, benchmarks, and key highlights with `Escape` key and backdrop dismiss.
- **Dynamic Real-Time Search & Filtering**: Instantaneous client-side filtering across keywords, titles, descriptions, and technology stacks.
- **Live GitHub REST Telemetry**: Asynchronously fetches public repository metrics, follower counts, and active repositories with automatic rate-limit and offline fallbacks.
- **Accessibility & Performance**: Semantic HTML5 landmark tags, full keyboard navigation, `aria-*` attributes, and zero bloated frameworks.

---

## 📄 License

This portfolio codebase is open-source and released under the [MIT License](https://opensource.org/licenses/MIT).
