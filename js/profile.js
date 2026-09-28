/**
 * SkillBridge Profile & Skills Section View Manager
 */

class ProfileView {
  constructor() {
    this.skillsGrid = document.getElementById("profileSkillsGrid");
    this.filterChips = document.querySelectorAll(".filter-chip");
    this.searchInput = document.getElementById("skillSearchInput");
    this.toastContainer = document.getElementById("toastContainer");

    this.bindEvents();
    this.renderSkills();
  }

  bindEvents() {
    // Filter Chips
    this.filterChips.forEach(chip => {
      chip.addEventListener("click", () => {
        this.filterChips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        window.appState.activeFilter = chip.getAttribute("data-filter");
        this.renderSkills();
      });
    });

    // Search input
    if (this.searchInput) {
      this.searchInput.addEventListener("input", (e) => {
        window.appState.searchQuery = e.target.value.toLowerCase().trim();
        this.renderSkills();
      });
    }
  }

  renderSkills() {
    if (!this.skillsGrid) return;

    let skills = window.appState.skills;
    const filter = window.appState.activeFilter;
    const query = window.appState.searchQuery;

    // Filter by category
    if (filter && filter !== "All") {
      skills = skills.filter(s => s.category.toLowerCase().includes(filter.toLowerCase()));
    }

    // Filter by search query
    if (query) {
      skills = skills.filter(s => 
        s.name.toLowerCase().includes(query) ||
        s.category.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        (s.tags && s.tags.some(t => t.toLowerCase().includes(query)))
      );
    }

    // Update count in header
    const countEl = document.getElementById("skillsCountBadge");
    if (countEl) {
      countEl.textContent = `${skills.length} Available`;
    }

    if (skills.length === 0) {
      this.skillsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 48px 24px; text-align: center; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-medium);">
          <div style="font-size: 2rem; margin-bottom: 8px;">🔍</div>
          <div style="font-weight: 700; font-size: 1.125rem; color: var(--text-primary); margin-bottom: 4px;">No skills match your filter</div>
          <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 16px;">Try adjusting your search query or switching categories.</div>
          <button class="btn btn-secondary btn-sm" onclick="window.profileView.clearFilters()">Reset Filters</button>
        </div>
      `;
      return;
    }

    this.skillsGrid.innerHTML = skills.map(skill => this.createSkillCardHtml(skill)).join("");

    // Attach click events to "Edit" buttons on each card
    this.skillsGrid.querySelectorAll(".edit-skill-trigger-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const skillId = btn.getAttribute("data-skill-id");
        if (window.editSkillModal) {
          window.editSkillModal.open(skillId);
        }
      });
    });
  }

  createSkillCardHtml(skill) {
    const isTarget = skill.id === "skill-101";
    const isJustUpdated = skill.justUpdated;
    const levelClass = `level-${skill.expertise.toLowerCase()}`;

    const tagsHtml = (skill.tags || []).map(tag => `
      <span class="skill-subtag">#${tag}</span>
    `).join("");

    return `
      <div class="skill-card ${isJustUpdated ? 'just-updated' : ''}" id="card-${skill.id}" data-skill-id="${skill.id}">
        ${isJustUpdated ? `
          <div class="just-updated-banner">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
            <span>Updated with Latest Details</span>
          </div>
        ` : ''}

        <div>
          <div class="skill-card-header" style="${isJustUpdated ? 'margin-top: 14px;' : ''}">
            <div class="skill-card-badges">
              <span class="category-tag">${skill.category}</span>
              <span class="level-badge ${levelClass}">
                ${this.getLevelIcon(skill.expertise)} ${skill.expertise}
              </span>
              ${skill.availableForSwap ? `
                <span class="badge badge-success" style="font-size:0.6875rem; padding: 2px 7px;">
                  ● Open for Swap
                </span>
              ` : `
                <span class="badge badge-neutral" style="font-size:0.6875rem; padding: 2px 7px;">
                  Paused
                </span>
              `}
            </div>
            
            <button class="skill-card-menu-btn" title="Skill options" aria-label="Skill options">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="2"/>
                <circle cx="12" cy="12" r="2"/>
                <circle cx="12" cy="19" r="2"/>
              </svg>
            </button>
          </div>

          <div class="skill-title-block">
            <h3 class="skill-title">
              <span>${skill.name}</span>
            </h3>
            <div class="skill-desc">${window.EditSkillModal ? window.EditSkillModal.parseMarkdown(skill.description) : skill.description}</div>
          </div>

          <div class="skill-tags-row">
            ${tagsHtml}
          </div>
        </div>

        <div class="skill-meta-footer">
          <div class="skill-metrics">
            <div class="skill-metric-item" title="Community Learners Mentored">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
              </svg>
              <span>${skill.learnersCount} learners</span>
            </div>
            <div class="skill-metric-item" title="Feedback rating">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="#FBBF24">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <span>${skill.rating}</span>
            </div>
          </div>

          <div class="skill-actions-group">
            <button class="edit-skill-trigger-btn" data-skill-id="${skill.id}" id="btnEditSkill_${skill.id}" title="Edit this skill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              <span>Edit Skill</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  getLevelIcon(level) {
    switch (level) {
      case "Beginner": return "🌱";
      case "Intermediate": return "🌿";
      case "Advanced": return "⚡";
      case "Expert": return "👑";
      default: return "⭐";
    }
  }

  highlightUpdatedSkill(skillId) {
    const card = document.getElementById(`card-${skillId}`);
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      card.classList.add("just-updated");

      // Auto remove intense pulse after 8 seconds
      setTimeout(() => {
        const banner = card.querySelector(".just-updated-banner");
        if (banner) {
          banner.style.transition = "opacity 0.6s ease";
          banner.style.opacity = "0";
          setTimeout(() => banner.remove(), 600);
        }
      }, 8000);
    }
  }

  clearFilters() {
    window.appState.activeFilter = "All";
    window.appState.searchQuery = "";
    if (this.searchInput) this.searchInput.value = "";
    this.filterChips.forEach(c => {
      if (c.getAttribute("data-filter") === "All") c.classList.add("active");
      else c.classList.remove("active");
    });
    this.renderSkills();
  }

  showToast(type, title, message, duration = 4500) {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-icon">
        ${type === 'success' ? `
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
        ` : `
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
        `}
      </div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close-btn" aria-label="Close notification">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;

    toast.querySelector(".toast-close-btn").addEventListener("click", () => {
      toast.classList.add("toast-leave");
      setTimeout(() => toast.remove(), 250);
    });

    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.add("toast-leave");
        setTimeout(() => toast.remove(), 250);
      }
    }, duration);
  }
}

window.ProfileView = ProfileView;
