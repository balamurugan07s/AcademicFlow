/**
 * GitHub Telemetry Engine
 * Fetches real-time profile stats & public repositories from GitHub REST API
 * Includes graceful offline and rate-limit fallbacks.
 */

class GitHubTelemetry {
  constructor(username = "balamurugan07s") {
    this.username = username;
    this.userEndpoint = `https://api.github.com/users/${this.username}`;
    this.reposEndpoint = `https://api.github.com/users/${this.username}/repos?sort=updated&per_page=6`;
    this.isLive = false;
  }

  async init() {
    try {
      const [userRes, reposRes] = await Promise.all([
        fetch(this.userEndpoint, { headers: { Accept: "application/vnd.github.v3+json" } }),
        fetch(this.reposEndpoint, { headers: { Accept: "application/vnd.github.v3+json" } })
      ]);

      if (!userRes.ok) {
        throw new Error(`GitHub API user query failed with status: ${userRes.status}`);
      }

      const userData = await userRes.json();
      let reposData = [];

      if (reposRes.ok) {
        reposData = await reposRes.json();
      }

      this.isLive = true;
      this.renderProfile(userData, true);
      this.renderRepos(reposData, true);
    } catch (error) {
      console.warn("GitHub Telemetry: Network/Rate-limit condition encountered, loading verified snapshot:", error.message);
      this.isLive = false;
      this.renderFallback();
    }
  }

  renderProfile(data, isLive) {
    const avatarEl = document.getElementById("gh-avatar");
    const nameEl = document.getElementById("gh-name");
    const handleEl = document.getElementById("gh-handle");
    const reposCountEl = document.getElementById("gh-repos-count");
    const followersEl = document.getElementById("gh-followers");
    const followingEl = document.getElementById("gh-following");
    const createdYearEl = document.getElementById("gh-created-year");
    const statusPillEl = document.getElementById("gh-telemetry-status");

    if (avatarEl && data.avatar_url) avatarEl.src = data.avatar_url;
    if (nameEl) nameEl.textContent = data.name || PROFILE_DATA.name;
    if (handleEl) {
      handleEl.textContent = `@${data.login || this.username}`;
      handleEl.href = data.html_url || `https://github.com/${this.username}`;
    }

    if (reposCountEl) reposCountEl.textContent = data.public_repos ?? GITHUB_FALLBACK_STATS.public_repos;
    if (followersEl) followersEl.textContent = data.followers ?? GITHUB_FALLBACK_STATS.followers;
    if (followingEl) followingEl.textContent = data.following ?? GITHUB_FALLBACK_STATS.following;

    if (createdYearEl) {
      const year = data.created_at ? new Date(data.created_at).getFullYear() : "2024";
      createdYearEl.textContent = year;
    }

    if (statusPillEl) {
      if (isLive) {
        statusPillEl.innerHTML = `
          <span class="pulse-dot"></span>
          <span>Live Synchronized</span>
        `;
      } else {
        statusPillEl.innerHTML = `
          <i class="fa-solid fa-cloud-arrow-down" style="color: var(--color-cyan);"></i>
          <span>Snapshot Cache</span>
        `;
      }
    }
  }

  renderRepos(repos, isLive) {
    const container = document.getElementById("gh-repos-container");
    if (!container) return;

    if (!repos || repos.length === 0) {
      this.renderFallbackRepos(container);
      return;
    }

    container.innerHTML = repos.map(repo => {
      const langColor = this.getLanguageColor(repo.language);
      const desc = repo.description || "Public repository and systems engineering module.";
      return `
        <div class="repo-card animate-card-enter">
          <div class="repo-card-top">
            <div class="repo-name-row">
              <i class="fa-regular fa-folder-open" style="color: var(--color-cyan);"></i>
              <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="repo-name-link">
                ${this.escapeHTML(repo.name)}
              </a>
            </div>
            <p class="repo-desc">${this.escapeHTML(desc)}</p>
          </div>
          <div class="repo-meta-row">
            ${repo.language ? `
              <span class="repo-meta-item">
                <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${langColor};"></span>
                <span>${repo.language}</span>
              </span>
            ` : ''}
            <span class="repo-meta-item">
              <i class="fa-regular fa-star"></i>
              <span>${repo.stargazers_count ?? 0}</span>
            </span>
            <span class="repo-meta-item">
              <i class="fa-solid fa-code-fork"></i>
              <span>${repo.forks_count ?? 0}</span>
            </span>
          </div>
        </div>
      `;
    }).join('');
  }

  renderFallback() {
    this.renderProfile(GITHUB_FALLBACK_STATS, false);
    const container = document.getElementById("gh-repos-container");
    if (container) {
      this.renderFallbackRepos(container);
    }
  }

  renderFallbackRepos(container) {
    const repos = GITHUB_FALLBACK_STATS.featured_repos;
    container.innerHTML = repos.map(repo => {
      const langColor = this.getLanguageColor(repo.language);
      return `
        <div class="repo-card animate-card-enter">
          <div class="repo-card-top">
            <div class="repo-name-row">
              <i class="fa-regular fa-folder-open" style="color: var(--color-cyan);"></i>
              <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="repo-name-link">
                ${this.escapeHTML(repo.name)}
              </a>
            </div>
            <p class="repo-desc">${this.escapeHTML(repo.description)}</p>
          </div>
          <div class="repo-meta-row">
            <span class="repo-meta-item">
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${langColor};"></span>
              <span>${repo.language}</span>
            </span>
            <span class="repo-meta-item">
              <i class="fa-regular fa-star"></i>
              <span>${repo.stars}</span>
            </span>
            <span class="repo-meta-item">
              <i class="fa-solid fa-code-fork"></i>
              <span>${repo.forks}</span>
            </span>
          </div>
        </div>
      `;
    }).join('');
  }

  getLanguageColor(language) {
    const colors = {
      TypeScript: "#3178c6",
      JavaScript: "#f7df1e",
      Go: "#00add8",
      Python: "#3572A5",
      C: "#555555",
      "C++": "#f34b7d",
      Rust: "#dea584",
      HTML: "#e34c26",
      CSS: "#563d7c"
    };
    return colors[language] || "#6366f1";
  }

  escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
