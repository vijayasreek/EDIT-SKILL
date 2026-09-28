/**
 * SkillBridge Application Orchestrator & Deliverables Showcase Manager
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Profile View and Edit Modal
  window.profileView = new ProfileView();
  window.editSkillModal = new EditSkillModal();

  // Setup Deliverable Preset Switcher
  setupDeliverableNavigator();

  // Setup Simulation Controls
  setupSimulationFlyout();

  // Setup Theme Switcher
  setupThemeSwitcher();

  // Setup Gallery Modal
  setupGalleryModal();

  // Initialize tooltips & banner
  updateDeliverableBanner(1);
});

/**
 * Deliverables Showcase Navigator
 * Maps directly to the 8 required screens in the prompt:
 * 1. Profile – Skills Section
 * 2. Edit Skill Form with Prefilled Data
 * 3. Loading Existing Skill State
 * 4. Validation/Error State
 * 5. Save Changes Loading State
 * 6. Successful Update State
 * 7. Updated Skill on Profile
 * 8. Save Failure / Retry State
 */
function setupDeliverableNavigator() {
  const deliverableButtons = document.querySelectorAll(".deliverable-btn");

  deliverableButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const preset = parseInt(btn.getAttribute("data-preset"), 10);
      activateDeliverablePreset(preset);
    });
  });
}

function activateDeliverablePreset(preset) {
  // Update button active state
  document.querySelectorAll(".deliverable-btn").forEach(b => {
    const p = parseInt(b.getAttribute("data-preset"), 10);
    if (p === preset) b.classList.add("active");
    else b.classList.remove("active");
  });

  window.appState.activePreset = preset;
  updateDeliverableBanner(preset);

  const modal = window.editSkillModal;
  const targetId = "skill-101";

  switch (preset) {
    case 1:
      // Screen 1: Profile – Skills Section
      modal.closeModalImmediately();
      window.scrollTo({ top: 0, behavior: "smooth" });
      break;

    case 2:
      // Screen 2: Edit Skill Form with Prefilled Data
      modal.open(targetId, false);
      break;

    case 3:
      // Screen 3: Loading Existing Skill State
      modal.open(targetId, true);
      break;

    case 4:
      // Screen 4: Validation/Error State
      modal.open(targetId, false);
      setTimeout(() => {
        // Clear fields to demonstrate inline validation errors
        modal.nameInput.value = "";
        modal.categorySelect.value = "";
        modal.descTextarea.value = "Too short";
        modal.setExpertiseLevel("");

        const validation = FormValidator.validateForm({
          skillName: "",
          category: "",
          description: "Too short",
          expertise: ""
        });
        FormValidator.displayErrors(validation.errors);
      }, 400);
      break;

    case 5:
      // Screen 5: Save Changes Loading State
      modal.open(targetId, false);
      setTimeout(() => {
        modal.showSaveLoadingState();
        const fill = document.getElementById("saveProgressBarFill");
        if (fill) fill.style.width = "65%";
      }, 400);
      break;

    case 6:
      // Screen 6: Successful Update State
      modal.open(targetId, false);
      setTimeout(() => {
        const skill = window.appState.getSkillById(targetId);
        modal.showSaveSuccessModal(skill);
      }, 400);
      break;

    case 7:
      // Screen 7: Updated Skill on Profile
      modal.closeModalImmediately();
      const updatedSkill = window.appState.updateSkill(targetId, {
        name: "Python Programming (Advanced Backend & APIs)",
        category: "Programming",
        description: "I teach Python fundamentals, robust asynchronous backend APIs with FastAPI, algorithm design, and clean architectural patterns.",
        expertise: "Advanced",
        availableForSwap: true
      });
      window.profileView.renderSkills();
      window.profileView.highlightUpdatedSkill(targetId);
      window.profileView.showToast(
        "success",
        "Profile Updated",
        "Python Programming skill card updated with latest info and highlighted on your profile."
      );
      break;

    case 8:
      // Screen 8: Save Failure / Retry State
      modal.open(targetId, false);
      setTimeout(() => {
        modal.showSaveFailureAlert();
      }, 400);
      break;
  }
}

const DELIVERABLE_INFO = {
  1: {
    title: "1. Profile – Skills Section",
    desc: "Complete user profile displaying saved skills as interactive skill cards with category tags, ratings, learner counts, and prominent 'Edit Skill' action buttons."
  },
  2: {
    title: "2. Edit Skill Form with Prefilled Data",
    desc: "Dedicated modal with prefilled Skill Name, Category, Description, and Level of Expertise selector, displaying skill ID and last modified metadata."
  },
  3: {
    title: "3. Loading Existing Skill State",
    desc: "Accessible skeleton loader shimmer with pulsing placeholders while skill data is asynchronously retrieved from the server."
  },
  4: {
    title: "4. Validation / Inline Error State",
    desc: "Inline error messages below relevant fields with warning badges, red focus rings, and top alert summary, strictly preserving user-entered input."
  },
  5: {
    title: "5. Save Changes Loading State",
    desc: "Progressive save overlay with animated spinner, animated progress bar, disabled form inputs, and clear saving status."
  },
  6: {
    title: "6. Successful Update State",
    desc: "Animated success confirmation checkmark modal confirming changes were persisted to the database before returning to profile."
  },
  7: {
    title: "7. Updated Skill on Profile",
    desc: "Real-time updated skill card on the profile with pulsating green border, 'Updated with Latest Details' badge, and success toast notification."
  },
  8: {
    title: "8. Save Failure / Retry State",
    desc: "Resilient error banner for network/server failures (HTTP 503) with a 1-click 'Retry Save' button and 100% preservation of all user modifications."
  }
};

function updateDeliverableBanner(preset) {
  const banner = document.getElementById("deliverableCallout");
  if (!banner) return;

  const info = DELIVERABLE_INFO[preset];
  if (!info) return;

  banner.innerHTML = `
    <div class="deliverable-callout-text">
      <span class="callout-badge">DELIVERABLE #${preset}</span>
      <div class="callout-desc">
        <strong>${info.title}:</strong> ${info.desc}
      </div>
    </div>
    <div style="display:flex; align-items:center; gap:8px;">
      <button class="btn btn-sm btn-outline" id="btnOpenGalleryModal" title="View all 8 deliverables side-by-side">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
        Deliverables Matrix
      </button>
    </div>
  `;

  // Re-bind gallery button inside banner
  const galleryBtn = document.getElementById("btnOpenGalleryModal");
  if (galleryBtn) {
    galleryBtn.addEventListener("click", () => {
      openGalleryModal();
    });
  }
}

/**
 * Simulation Controls Flyout
 */
function setupSimulationFlyout() {
  const triggerBtn = document.getElementById("btnToggleSimulations");
  const flyout = document.getElementById("simulationsFlyout");
  const slowNetSwitch = document.getElementById("switchSlowNetwork");
  const saveErrSwitch = document.getElementById("switchSaveError");
  const loadErrSwitch = document.getElementById("switchLoadError");
  const resetBtn = document.getElementById("btnResetDemoData");

  if (!triggerBtn || !flyout) return;

  triggerBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    flyout.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (!flyout.contains(e.target) && e.target !== triggerBtn) {
      flyout.classList.remove("open");
    }
  });

  if (slowNetSwitch) {
    slowNetSwitch.addEventListener("change", (e) => {
      window.appState.simulations.slowNetwork = e.target.checked;
    });
  }

  if (saveErrSwitch) {
    saveErrSwitch.addEventListener("change", (e) => {
      window.appState.simulations.simulateSaveError = e.target.checked;
    });
  }

  if (loadErrSwitch) {
    loadErrSwitch.addEventListener("change", (e) => {
      window.appState.simulations.simulateLoadError = e.target.checked;
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      window.appState.resetDemoData();
      window.profileView.renderSkills();
      window.profileView.showToast("success", "Demo Data Reset", "Initial profile skills restored.");
      flyout.classList.remove("open");
    });
  }
}

/**
 * Theme Switcher
 */
function setupThemeSwitcher() {
  const themeBtn = document.getElementById("btnThemeToggle");
  if (!themeBtn) return;

  const currentTheme = window.appState.theme;
  document.documentElement.setAttribute("data-theme", currentTheme);
  updateThemeIcon(currentTheme);

  themeBtn.addEventListener("click", () => {
    const nextTheme = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", nextTheme);
    window.appState.theme = nextTheme;
    localStorage.setItem("skillbridge_theme", nextTheme);
    updateThemeIcon(nextTheme);
  });
}

function updateThemeIcon(theme) {
  const btn = document.getElementById("btnThemeToggle");
  if (!btn) return;

  if (theme === "light") {
    btn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
    `;
    btn.setAttribute("title", "Switch to Dark Mode");
  } else {
    btn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>
    `;
    btn.setAttribute("title", "Switch to Light Mode");
  }
}

/**
 * Deliverables Matrix Modal
 */
function setupGalleryModal() {
  const overlay = document.getElementById("galleryModal");
  const closeBtn = document.getElementById("btnCloseGallery");

  if (!overlay || !closeBtn) return;

  closeBtn.addEventListener("click", () => {
    overlay.classList.remove("open");
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.classList.remove("open");
  });

  // Render deliverable matrix items
  const galleryBody = document.getElementById("galleryModalBody");
  if (galleryBody) {
    const items = Object.entries(DELIVERABLE_INFO).map(([key, info]) => `
      <div class="gallery-item-card" onclick="activateDeliverablePreset(${key}); document.getElementById('galleryModal').classList.remove('open');">
        <div>
          <div class="gallery-item-header">
            <span class="gallery-item-num">STATE 0${key}</span>
            <span class="badge badge-primary" style="font-size:0.6875rem;">Interactive Preset</span>
          </div>
          <h4 class="gallery-item-title">${info.title}</h4>
          <p class="gallery-item-desc" style="margin-top:6px;">${info.desc}</p>
        </div>
        <div style="margin-top:auto;">
          <button class="btn btn-sm btn-outline gallery-view-btn">
            Jump to Screen 0${key} &rarr;
          </button>
        </div>
      </div>
    `).join("");

    galleryBody.innerHTML = items;
  }
}

function openGalleryModal() {
  const overlay = document.getElementById("galleryModal");
  if (overlay) overlay.classList.add("open");
}
