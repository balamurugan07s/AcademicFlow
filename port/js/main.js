/**
 * Master Application Logic - Portfolio Interaction Engine
 * Handles theme toggling, dynamic card rendering, real-time filtering,
 * interactive deep-dive modal, and live telemetry bootstrap.
 */

document.addEventListener("DOMContentLoaded", () => {
  App.init();
});

const App = {
  activeCategory: "all",
  searchQuery: "",
  activeModalProjectId: null,

  init() {
    this.initTheme();
    this.renderProfileDetails();
    this.renderSkillsMatrix();
    this.renderProjects();
    this.initFilterEvents();
    this.initSearchEvents();
    this.initModalEvents();
    this.initMobileNav();
    this.initEmailCopy();
    this.initGitHubStats();
  },

  /* ==========================================================================
     THEME CONTROLLER (Dark / Light with LocalStorage Persistence)
     ========================================================================== */
  initTheme() {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    const currentTheme = savedTheme || (systemPrefersLight ? "light" : "dark");

    this.applyTheme(currentTheme);

    const toggleBtn = document.getElementById("theme-toggle");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        const active = document.documentElement.getAttribute("data-theme") || "dark";
        const nextTheme = active === "dark" ? "light" : "dark";
        this.applyTheme(nextTheme);
      });
    }
  },

  applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    const toggleBtn = document.getElementById("theme-toggle");
    if (toggleBtn) {
      toggleBtn.innerHTML = theme === "dark"
        ? '<i class="fa-regular fa-sun" title="Switch to Light Theme"></i>'
        : '<i class="fa-solid fa-moon" title="Switch to Dark Theme"></i>';
      toggleBtn.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} theme`);
    }
  },

  /* ==========================================================================
     MOBILE NAVIGATION
     ========================================================================== */
  initMobileNav() {
    const toggleBtn = document.getElementById("mobile-toggle");
    const navMenu = document.getElementById("nav-menu");

    if (toggleBtn && navMenu) {
      toggleBtn.addEventListener("click", () => {
        const isOpen = navMenu.classList.toggle("open");
        toggleBtn.innerHTML = isOpen
          ? '<i class="fa-solid fa-xmark"></i>'
          : '<i class="fa-solid fa-bars"></i>';
        toggleBtn.setAttribute("aria-expanded", isOpen);
      });

      // Close menu when clicking navigation links
      navMenu.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", () => {
          navMenu.classList.remove("open");
          toggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
          toggleBtn.setAttribute("aria-expanded", "false");
        });
      });
    }
  },

  /* ==========================================================================
     PROFILE & ACADEMIC DATA INJECTION
     ========================================================================== */
  renderProfileDetails() {
    // Populate text fields by ID
    this.safeTextSet("hero-name", PROFILE_DATA.name);
    this.safeTextSet("hero-tagline", PROFILE_DATA.tagline);
    this.safeTextSet("hero-institution-badge", PROFILE_DATA.fullInstitution);

    // Academic Card Details
    this.safeTextSet("acad-name", PROFILE_DATA.name);
    this.safeTextSet("acad-reg", PROFILE_DATA.registerNumber);
    this.safeTextSet("acad-degree", PROFILE_DATA.degree);
    this.safeTextSet("acad-year", PROFILE_DATA.yearSemester);
    this.safeTextSet("acad-batch", PROFILE_DATA.academicBatch);
    this.safeTextSet("acad-cgpa", PROFILE_DATA.cgpa);
    this.safeTextSet("acad-email", PROFILE_DATA.officialEmail);
    this.safeTextSet("acad-gh", `@${PROFILE_DATA.githubUsername}`);
    this.safeTextSet("acad-campus", PROFILE_DATA.campus);

    // Quantitative Counter Bar
    const counterBar = document.getElementById("hero-metrics-bar");
    if (counterBar && PROFILE_DATA.heroMetrics) {
      counterBar.innerHTML = PROFILE_DATA.heroMetrics.map(item => `
        <div class="metric-counter-item">
          <div class="metric-icon-wrap">
            <i class="${item.icon}"></i>
          </div>
          <div class="metric-counter-info">
            <span class="metric-counter-number">${item.number}</span>
            <span class="metric-counter-label">${item.label}</span>
          </div>
        </div>
      `).join("");
    }

    // Coursework tag pills
    const courseworkWrap = document.getElementById("coursework-pills-wrap");
    if (courseworkWrap && PROFILE_DATA.coursework) {
      courseworkWrap.innerHTML = PROFILE_DATA.coursework.map(c => `
        <span class="coursework-pill cat-${c.category}">
          <i class="fa-solid fa-check"></i>
          <span>${c.name}</span>
        </span>
      `).join("");
    }

    // Academic highlights
    const highlightsWrap = document.getElementById("academic-highlights-wrap");
    if (highlightsWrap && PROFILE_DATA.academicHighlights) {
      highlightsWrap.innerHTML = PROFILE_DATA.academicHighlights.map(h => `
        <div class="academic-highlight-item">
          <i class="fa-solid fa-award"></i>
          <span>${h}</span>
        </div>
      `).join("");
    }
  },

  /* ==========================================================================
     SKILLS MATRIX RENDERING
     ========================================================================== */
  renderSkillsMatrix() {
    const container = document.getElementById("skills-container");
    if (!container || !SKILLS_DATA) return;

    container.innerHTML = SKILLS_DATA.map(cat => `
      <div class="skill-category-card">
        <div class="skill-category-header">
          <div class="skill-cat-icon">
            <i class="${cat.icon}"></i>
          </div>
          <h3 class="skill-cat-title">${cat.category}</h3>
        </div>
        <div class="skill-pills-list">
          ${cat.skills.map(s => `
            <div class="skill-pill">
              <i class="${s.icon}"></i>
              <span>${s.name}</span>
              <span class="skill-level-tag">${s.level}</span>
            </div>
          `).join("")}
        </div>
      </div>
    `).join("");
  },

  /* ==========================================================================
     PROJECTS FILTERING & RENDERING
     ========================================================================== */
  initFilterEvents() {
    const filterButtons = document.querySelectorAll(".filter-btn");
    filterButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.activeCategory = btn.getAttribute("data-category");
        this.renderProjects();
      });
    });
  },

  initSearchEvents() {
    const searchInput = document.getElementById("project-search");
    const clearBtn = document.getElementById("search-clear");

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        if (clearBtn) {
          clearBtn.style.display = this.searchQuery.length > 0 ? "block" : "none";
        }
        this.renderProjects();
      });
    }

    if (clearBtn && searchInput) {
      clearBtn.addEventListener("click", () => {
        searchInput.value = "";
        this.searchQuery = "";
        clearBtn.style.display = "none";
        searchInput.focus();
        this.renderProjects();
      });
    }
  },

  renderProjects() {
    const container = document.getElementById("projects-grid");
    const counterBadge = document.getElementById("projects-counter");
    if (!container || !PROJECTS_DATA) return;

    // Filter projects by active category and search query
    const filtered = PROJECTS_DATA.filter(project => {
      const matchesCategory = this.activeCategory === "all" ||
        project.category === this.activeCategory ||
        (this.activeCategory === "web" && project.domain.toLowerCase().includes("full-stack"));
      const q = this.searchQuery;
      const matchesSearch = !q ||
        project.title.toLowerCase().includes(q) ||
        project.subtitle.toLowerCase().includes(q) ||
        project.description.toLowerCase().includes(q) ||
        project.domain.toLowerCase().includes(q) ||
        project.techStack.some(tech => tech.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });

    // Update Counter
    if (counterBadge) {
      const unit = PROJECTS_DATA.length === 1 ? 'Project' : 'Projects';
      counterBadge.textContent = `Showing ${filtered.length} of ${PROJECTS_DATA.length} ${unit}`;
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="project-empty-state">
          <i class="fa-solid fa-code-merge"></i>
          <h3>No matching engineering projects found</h3>
          <p>Try refining your search keyword or switching category filters.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(project => `
      <div class="project-card ${project.statusClass} animate-card-enter" data-id="${project.id}">
        <div>
          <div class="project-card-header">
            <div class="project-card-badges">
              <span class="badge badge-accent">${project.domain}</span>
              <span class="badge badge-status">
                <span class="pulse-dot" style="${project.status === 'Completed' ? 'background-color:#38bdf8;' : ''}"></span>
                ${project.status}
              </span>
            </div>
            <div class="project-card-icon">
              <i class="${project.icon}"></i>
            </div>
          </div>

          <h3 class="project-card-title">${project.title}</h3>
          <p class="project-card-subtitle">${project.subtitle}</p>
          <p class="project-card-description">${project.description}</p>
        </div>

        <div>
          <!-- Metric Badges -->
          <div class="project-card-metrics">
            ${project.metrics.slice(0, 2).map(m => `
              <div class="project-metric-item">
                <span class="project-metric-label">${m.label}</span>
                <span class="project-metric-value">${m.value}</span>
              </div>
            `).join("")}
          </div>

          <!-- Tech Stack Tags -->
          <div class="project-card-stack">
            ${project.techStack.slice(0, 5).map(t => `<span class="tech-tag">${t}</span>`).join("")}
            ${project.techStack.length > 5 ? `<span class="tech-tag">+${project.techStack.length - 5}</span>` : ""}
          </div>

          <!-- Action Buttons -->
          <div class="project-card-actions">
            <button type="button" class="btn btn-primary btn-sm deep-dive-trigger" data-id="${project.id}">
              <i class="fa-solid fa-microchip"></i>
              <span>Deep Dive</span>
            </button>
            <a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" title="View GitHub Repository">
              <i class="fa-brands fa-github"></i>
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    `).join("");

    // Re-attach deep-dive modal triggers
    container.querySelectorAll(".deep-dive-trigger").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        this.openModal(id);
      });
    });

    container.querySelectorAll(".project-card").forEach(card => {
      card.addEventListener("click", (e) => {
        // Prevent opening if user clicked a link
        if (e.target.closest("a")) return;
        const id = card.getAttribute("data-id");
        this.openModal(id);
      });
    });
  },

  /* ==========================================================================
     DEEP-DIVE ARCHITECTURAL MODAL
     ========================================================================== */
  initModalEvents() {
    const backdrop = document.getElementById("project-modal-backdrop");
    const closeBtn = document.getElementById("modal-close-btn");

    if (closeBtn && backdrop) {
      closeBtn.addEventListener("click", () => this.closeModal());
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) this.closeModal();
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && backdrop && backdrop.classList.contains("open")) {
        this.closeModal();
      }
    });
  },

  openModal(projectId) {
    const project = PROJECTS_DATA.find(p => p.id === projectId);
    if (!project) return;

    this.activeModalProjectId = projectId;
    const backdrop = document.getElementById("project-modal-backdrop");

    // Populate modal elements
    this.safeTextSet("modal-title", project.title);
    this.safeTextSet("modal-subtitle", project.subtitle);
    this.safeTextSet("modal-badge-domain", project.domain);
    this.safeTextSet("modal-badge-status", project.status);
    this.safeTextSet("modal-desc", project.description);
    this.safeTextSet("modal-architecture", project.architecture);

    // Populate Highlights
    const highlightsWrap = document.getElementById("modal-highlights-wrap");
    if (highlightsWrap) {
      highlightsWrap.innerHTML = project.keyHighlights.map(h => `
        <div class="modal-highlight-item">
          <i class="fa-solid fa-circle-check"></i>
          <span>${h}</span>
        </div>
      `).join("");
    }

    // Populate Metrics
    const metricsWrap = document.getElementById("modal-metrics-wrap");
    if (metricsWrap) {
      metricsWrap.innerHTML = project.metrics.map(m => `
        <div class="modal-metric-card">
          <span class="modal-metric-label">${m.label}</span>
          <span class="modal-metric-value">${m.value}</span>
        </div>
      `).join("");
    }

    // Populate Full Tech Stack
    const stackWrap = document.getElementById("modal-stack-wrap");
    if (stackWrap) {
      stackWrap.innerHTML = project.techStack.map(t => `<span class="tech-tag font-mono">${t}</span>`).join("");
    }

    // Modal Action Links
    const modalGithubLink = document.getElementById("modal-github-link");
    if (modalGithubLink) {
      modalGithubLink.href = project.githubUrl;
    }

    // Show backdrop
    if (backdrop) {
      backdrop.classList.add("open");
      backdrop.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
  },

  closeModal() {
    const backdrop = document.getElementById("project-modal-backdrop");
    if (backdrop) {
      backdrop.classList.remove("open");
      backdrop.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      this.activeModalProjectId = null;
    }
  },

  /* ==========================================================================
     CLIPBOARD EMAIL COPY ACTION
     ========================================================================== */
  initEmailCopy() {
    const copyBtn = document.getElementById("copy-email-btn");
    if (copyBtn) {
      copyBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(PROFILE_DATA.officialEmail);
          const originalHTML = copyBtn.innerHTML;
          copyBtn.innerHTML = `
            <i class="fa-solid fa-check" style="color: var(--color-success);"></i>
            <span>Email Copied!</span>
          `;
          setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
          }, 2000);
        } catch (err) {
          console.error("Clipboard copy error:", err);
        }
      });
    }
  },

  /* ==========================================================================
     GITHUB TELEMETRY BOOTSTRAP
     ========================================================================== */
  initGitHubStats() {
    const telemetry = new GitHubTelemetry(PROFILE_DATA.githubUsername);
    telemetry.init();
  },

  safeTextSet(id, text) {
    const el = document.getElementById(id);
    if (el && text !== undefined) {
      el.textContent = text;
    }
  }
};
