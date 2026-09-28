/**
 * SkillBridge Edit Skill Modal Controller
 */

class EditSkillModal {
  constructor() {
    this.overlay = document.getElementById("editSkillModal");
    this.dialog = document.getElementById("editSkillDialog");
    this.form = document.getElementById("editSkillForm");
    this.formBody = document.getElementById("modalFormBody");
    this.loadingContainer = document.getElementById("modalLoadingView");
    this.loadErrorContainer = document.getElementById("modalLoadErrorView");
    this.successContainer = document.getElementById("modalSuccessView");
    this.saveOverlay = document.getElementById("modalSaveLoadingOverlay");
    this.unsavedDialog = document.getElementById("unsavedConfirmDialog");

    // Form inputs
    this.nameInput = document.getElementById("inputSkillName");
    this.categorySelect = document.getElementById("selectSkillCategory");
    this.descTextarea = document.getElementById("textareaSkillDesc");
    this.descPreview = document.getElementById("descMarkdownPreview");
    this.tabWrite = document.getElementById("tabDescWrite");
    this.tabPreview = document.getElementById("tabDescPreview");
    this.swapAvailableCheckbox = document.getElementById("checkboxSwapAvailable");
    this.expertiseCards = document.querySelectorAll(".expertise-card");
    this.charCounter = document.getElementById("descCharCounter");
    this.nameCharCounter = document.getElementById("nameCharCounter");

    // Action buttons
    this.saveBtn = document.getElementById("btnSaveSkill");
    this.cancelBtn = document.getElementById("btnCancelEdit");
    this.closeBtn = document.getElementById("btnCloseModal");

    this.initialData = null;
    this.isDirty = false;
    this.currentSkillId = null;

    this.bindEvents();
    this.bindMarkdownTools();
  }

  bindEvents() {
    // Modal Close Triggers
    this.closeBtn.addEventListener("click", () => this.handleCancelAttempt());
    this.cancelBtn.addEventListener("click", () => this.handleCancelAttempt());

    // Click outside backdrop
    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay) {
        this.handleCancelAttempt();
      }
    });

    // Keyboard ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen()) {
        if (this.unsavedDialog.classList.contains("open")) {
          this.closeUnsavedDialog();
        } else {
          this.handleCancelAttempt();
        }
      }
    });

    // Expertise Cards Selection
    this.expertiseCards.forEach(card => {
      card.addEventListener("click", () => {
        const level = card.getAttribute("data-level");
        this.setExpertiseLevel(level);
        this.checkDirtyState();
        FormValidator.clearFieldError("expertise");
      });

      // Keyboard accessibility for cards
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          card.click();
        }
      });
    });

    // Real-time character counts and validation clearance
    this.nameInput.addEventListener("input", () => {
      this.updateNameCharCount();
      this.checkDirtyState();
      FormValidator.clearFieldError("skillName");
    });

    this.descTextarea.addEventListener("input", () => {
      this.updateDescCharCount();
      this.checkDirtyState();
      FormValidator.clearFieldError("description");
    });

    this.categorySelect.addEventListener("change", () => {
      this.checkDirtyState();
      FormValidator.clearFieldError("category");
    });

    this.swapAvailableCheckbox.addEventListener("change", () => {
      this.checkDirtyState();
    });

    // Form Submission
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSaveChanges();
    });

    // Unsaved Changes Dialog actions
    document.getElementById("btnDiscardChanges").addEventListener("click", () => {
      this.closeUnsavedDialog();
      this.closeModalImmediately();
    });

    document.getElementById("btnKeepEditing").addEventListener("click", () => {
      this.closeUnsavedDialog();
    });

    // Retry Load Button
    document.getElementById("btnRetryLoad").addEventListener("click", () => {
      this.loadSkill(this.currentSkillId);
    });
  }

  bindMarkdownTools() {
    // Formatting buttons
    const btnBold = document.getElementById("btnMdBold");
    const btnItalic = document.getElementById("btnMdItalic");
    const btnBullet = document.getElementById("btnMdBullet");
    const btnCode = document.getElementById("btnMdCode");

    if (btnBold) btnBold.addEventListener("click", () => this.insertMarkdown("**", "**"));
    if (btnItalic) btnItalic.addEventListener("click", () => this.insertMarkdown("*", "*"));
    if (btnBullet) btnBullet.addEventListener("click", () => this.insertMarkdown("\n• ", ""));
    if (btnCode) btnCode.addEventListener("click", () => this.insertMarkdown("`", "`"));

    // Template chips
    document.querySelectorAll(".template-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const type = chip.getAttribute("data-template");
        this.insertTemplate(type);
      });
    });

    // Write / Preview Tabs
    if (this.tabWrite && this.tabPreview) {
      this.tabWrite.addEventListener("click", () => this.setDescMode("write"));
      this.tabPreview.addEventListener("click", () => this.setDescMode("preview"));
    }
  }

  insertMarkdown(prefix, suffix) {
    this.setDescMode("write");
    const textarea = this.descTextarea;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    const replacement = prefix + (selected || "text") + suffix;

    textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    textarea.focus();
    textarea.selectionStart = start + prefix.length;
    textarea.selectionEnd = start + prefix.length + (selected ? selected.length : 4);

    this.updateDescCharCount();
    this.checkDirtyState();
    FormValidator.clearFieldError("description");
  }

  insertTemplate(type) {
    this.setDescMode("write");
    let templateText = "";
    switch (type) {
      case "topics":
        templateText = "\n\n🎯 **Topics Covered:**\n• Core Python syntax & data structures\n• Object-Oriented design & clean code\n• Building REST APIs with FastAPI";
        break;
      case "prereqs":
        templateText = "\n\n📋 **Prerequisites:**\n• Basic programming curiosity, no prior Python required";
        break;
      case "exchange":
        templateText = "\n\n🤝 **Exchange Format:**\n• 45-min live pair programming or async code reviews";
        break;
    }

    const curVal = this.descTextarea.value.trim();
    // Check if adding exceeds 500
    if ((curVal + templateText).length > 500) {
      templateText = templateText.substring(0, 500 - curVal.length);
    }

    this.descTextarea.value = curVal + templateText;
    this.updateDescCharCount();
    this.checkDirtyState();
    FormValidator.clearFieldError("description");
    this.descTextarea.focus();
    this.descTextarea.scrollTop = this.descTextarea.scrollHeight;
  }

  setDescMode(mode) {
    if (mode === "preview") {
      this.tabWrite.classList.remove("active");
      this.tabPreview.classList.add("active");
      this.descTextarea.style.display = "none";
      this.descPreview.classList.add("active");
      this.descPreview.innerHTML = EditSkillModal.parseMarkdown(this.descTextarea.value);
    } else {
      this.tabWrite.classList.add("active");
      this.tabPreview.classList.remove("active");
      this.descTextarea.style.display = "block";
      this.descPreview.classList.remove("active");
      this.descTextarea.focus();
    }
  }

  static parseMarkdown(text) {
    if (!text) return "<em>No description provided.</em>";

    let escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Bold **text**
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Italic *text*
    escaped = escaped.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Code `code`
    escaped = escaped.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Bullets (lines starting with • or -)
    const lines = escaped.split("\n");
    let inList = false;
    let result = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith("• ") || trimmed.startsWith("- ")) {
        if (!inList) {
          result.push("<ul>");
          inList = true;
        }
        result.push(`<li>${trimmed.replace(/^[•\-]\s*/, "")}</li>`);
      } else {
        if (inList) {
          result.push("</ul>");
          inList = false;
        }
        if (trimmed) {
          result.push(`<p style="margin-bottom:6px;">${line}</p>`);
        } else {
          result.push("<div style='height:4px;'></div>");
        }
      }
    });

    if (inList) {
      result.push("</ul>");
    }

    return result.join("");
  }

  isOpen() {
    return this.overlay.classList.contains("open");
  }

  /**
   * Opens the edit modal and loads skill data
   * @param {string} skillId 
   * @param {boolean} forceLoadingVisual - For previewing the loading deliverable
   */
  open(skillId = "skill-101", forceLoadingVisual = false) {
    this.currentSkillId = skillId;
    window.appState.currentEditingSkillId = skillId;

    // Reset view states
    this.resetViewContainers();
    FormValidator.clearAllErrors();
    this.clearAlertBanner();

    this.overlay.classList.add("open");
    document.body.style.overflow = "hidden";

    if (forceLoadingVisual) {
      this.showLoadingView();
      return;
    }

    this.loadSkill(skillId);
  }

  /**
   * Simulates loading existing skill information from server
   * @param {string} skillId 
   */
  loadSkill(skillId) {
    this.showLoadingView();

    const isSlow = window.appState.simulations.slowNetwork;
    const delay = isSlow ? 1400 : 350;

    setTimeout(() => {
      // Check if simulate load error is active
      if (window.appState.simulations.simulateLoadError) {
        this.showLoadErrorView("Network Connection Timeout", "We couldn't retrieve the skill details from the server (HTTP 504 Gateway Timeout). Please check your connection and try again.");
        return;
      }

      const skill = window.appState.getSkillById(skillId);
      if (!skill) {
        this.showLoadErrorView("Skill Not Found", "The requested skill record could not be located. It may have been archived or deleted on another device.");
        return;
      }

      // Populate form with existing data
      this.populateForm(skill);
      this.showFormView();
    }, delay);
  }

  populateForm(skill) {
    this.initialData = {
      name: skill.name,
      category: skill.category,
      description: skill.description,
      expertise: skill.expertise,
      availableForSwap: !!skill.availableForSwap
    };

    // Header metadata
    document.getElementById("modalSkillNameDisplay").textContent = skill.name;
    document.getElementById("modalSkillIdDisplay").textContent = `#${skill.id.toUpperCase()}`;
    document.getElementById("modalLastUpdatedDisplay").textContent = `Last modified: ${skill.lastUpdated || "Oct 14, 2025"}`;

    // Fill inputs
    this.nameInput.value = skill.name;
    this.categorySelect.value = skill.category;
    this.descTextarea.value = skill.description;
    this.swapAvailableCheckbox.checked = skill.availableForSwap;

    // Set expertise
    this.setExpertiseLevel(skill.expertise);

    // Update counters
    this.updateNameCharCount();
    this.updateDescCharCount();

    this.isDirty = false;
    this.updateDirtyIndicator();
  }

  setExpertiseLevel(level) {
    this.expertiseCards.forEach(card => {
      const cardLevel = card.getAttribute("data-level");
      const radio = card.querySelector("input[type='radio']");
      if (cardLevel === level) {
        card.classList.add("selected");
        card.setAttribute("aria-checked", "true");
        if (radio) radio.checked = true;
      } else {
        card.classList.remove("selected");
        card.setAttribute("aria-checked", "false");
        if (radio) radio.checked = false;
      }
    });
  }

  getSelectedExpertise() {
    const selected = document.querySelector(".expertise-card.selected");
    return selected ? selected.getAttribute("data-level") : "";
  }

  getFormData() {
    return {
      skillName: this.nameInput.value.trim(),
      category: this.categorySelect.value,
      description: this.descTextarea.value.trim(),
      expertise: this.getSelectedExpertise(),
      availableForSwap: this.swapAvailableCheckbox.checked
    };
  }

  checkDirtyState() {
    if (!this.initialData) return false;

    const current = this.getFormData();
    this.isDirty = (
      current.skillName !== this.initialData.name ||
      current.category !== this.initialData.category ||
      current.description !== this.initialData.description ||
      current.expertise !== this.initialData.expertise ||
      current.availableForSwap !== this.initialData.availableForSwap
    );

    this.updateDirtyIndicator();
    return this.isDirty;
  }

  updateDirtyIndicator() {
    const dot = document.getElementById("unsavedChangesIndicator");
    const text = document.getElementById("modalSaveStatusText");
    if (!dot || !text) return;

    if (this.isDirty) {
      dot.style.display = "inline-block";
      text.textContent = "Unsaved changes";
      text.style.color = "var(--warning)";
    } else {
      dot.style.display = "none";
      text.textContent = "All changes saved to cloud";
      text.style.color = "var(--text-muted)";
    }
  }

  updateNameCharCount() {
    const len = this.nameInput.value.length;
    this.nameCharCounter.textContent = `${len}/60`;
    if (len >= 55) {
      this.nameCharCounter.className = "char-counter limit-near";
    } else {
      this.nameCharCounter.className = "char-counter";
    }
  }

  updateDescCharCount() {
    const len = this.descTextarea.value.length;
    this.charCounter.textContent = `${len}/500`;
    if (len >= 480) {
      this.charCounter.className = "char-counter limit-near";
    } else {
      this.charCounter.className = "char-counter";
    }
  }

  handleCancelAttempt() {
    if (this.isDirty) {
      this.openUnsavedDialog();
    } else {
      this.closeModalImmediately();
    }
  }

  openUnsavedDialog() {
    this.unsavedDialog.classList.add("open");
  }

  closeUnsavedDialog() {
    this.unsavedDialog.classList.remove("open");
  }

  closeModalImmediately() {
    this.overlay.classList.remove("open");
    document.body.style.overflow = "";
    this.isDirty = false;
    this.resetViewContainers();
  }

  resetViewContainers() {
    this.loadingContainer.classList.remove("active");
    this.loadErrorContainer.classList.remove("active");
    this.successContainer.classList.remove("active");
    this.saveOverlay.classList.remove("active");
    this.formBody.style.display = "flex";
    this.saveBtn.disabled = false;
    this.saveBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
      </svg>
      <span>Save Changes</span>
    `;
  }

  showLoadingView() {
    this.loadingContainer.classList.add("active");
    this.loadErrorContainer.classList.remove("active");
    this.successContainer.classList.remove("active");
    this.formBody.style.display = "none";
  }

  showLoadErrorView(title, message) {
    this.loadingContainer.classList.remove("active");
    this.formBody.style.display = "none";
    this.loadErrorContainer.classList.add("active");

    document.getElementById("loadErrorTitle").textContent = title;
    document.getElementById("loadErrorMessage").textContent = message;
  }

  showFormView() {
    this.loadingContainer.classList.remove("active");
    this.loadErrorContainer.classList.remove("active");
    this.successContainer.classList.remove("active");
    this.formBody.style.display = "flex";
  }

  clearAlertBanner() {
    const alertBanner = document.getElementById("modalAlertBanner");
    if (alertBanner) {
      alertBanner.style.display = "none";
      alertBanner.innerHTML = "";
      alertBanner.className = "form-alert-banner";
    }
  }

  /**
   * Save Changes Workflow Execution
   */
  handleSaveChanges() {
    const formData = this.getFormData();

    // 1. Validate updated information
    const validation = FormValidator.validateForm(formData);
    if (!validation.isValid) {
      FormValidator.displayErrors(validation.errors);
      return;
    }

    FormValidator.clearAllErrors();
    this.clearAlertBanner();

    // 2. Show Save Loading State
    this.showSaveLoadingState();

    const isSlow = window.appState.simulations.slowNetwork;
    const saveDelay = isSlow ? 1800 : 900;

    // Simulate progress bar animation
    const progressFill = document.getElementById("saveProgressBarFill");
    if (progressFill) {
      progressFill.style.width = "0%";
      setTimeout(() => { progressFill.style.width = "45%"; }, 200);
      setTimeout(() => { progressFill.style.width = "85%"; }, 600);
    }

    setTimeout(() => {
      // Check simulation failure state
      if (window.appState.simulations.simulateSaveError) {
        this.hideSaveLoadingState();
        this.showSaveFailureAlert();
        return;
      }

      if (progressFill) progressFill.style.width = "100%";

      // 3. Update existing skill record (rather than creating a new skill)
      const updatedSkill = window.appState.updateSkill(this.currentSkillId, {
        name: formData.skillName,
        category: formData.category,
        description: formData.description,
        expertise: formData.expertise,
        availableForSwap: formData.availableForSwap
      });

      // 4. Show success confirmation
      this.hideSaveLoadingState();
      this.showSaveSuccessModal(updatedSkill);

    }, saveDelay);
  }

  showSaveLoadingState() {
    this.saveOverlay.classList.add("active");
    this.saveBtn.disabled = true;
    this.cancelBtn.disabled = true;
    this.closeBtn.disabled = true;
  }

  hideSaveLoadingState() {
    this.saveOverlay.classList.remove("active");
    this.saveBtn.disabled = false;
    this.cancelBtn.disabled = false;
    this.closeBtn.disabled = false;
  }

  /**
   * Save Failure / Retry State
   * Crucial: Preserves the user's entered information when error occurs!
   */
  showSaveFailureAlert() {
    const alertBanner = document.getElementById("modalAlertBanner");
    if (alertBanner) {
      alertBanner.className = "form-alert-banner alert-danger server-error";
      alertBanner.innerHTML = `
        <svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor" style="flex-shrink:0; margin-top:2px;">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <div style="flex:1;">
          <div class="alert-title">Update Failed (HTTP 503 Service Unavailable)</div>
          <div>Unable to sync your changes with the server. All your entered modifications have been securely preserved in this form.</div>
          <div class="alert-actions">
            <button type="button" class="btn btn-sm btn-danger" id="btnRetrySaveInAlert">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 4v6h-6M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
              </svg>
              Retry Save
            </button>
            <span style="font-size:0.75rem; color:var(--text-muted);">or check your internet connection</span>
          </div>
        </div>
      `;
      alertBanner.style.display = "flex";

      // Attach retry button handler
      const retryBtn = document.getElementById("btnRetrySaveInAlert");
      if (retryBtn) {
        retryBtn.addEventListener("click", () => {
          this.handleSaveChanges();
        });
      }
    }

    // Accessible scroll to top of modal
    this.formBody.scrollTop = 0;
  }

  showSaveSuccessModal(updatedSkill) {
    this.formBody.style.display = "none";
    this.successContainer.classList.add("active");

    document.getElementById("successSkillTitle").textContent = updatedSkill.name;

    // After 1.4s, return user to profile and highlight updated card
    setTimeout(() => {
      this.closeModalImmediately();
      window.profileView.renderSkills();
      window.profileView.highlightUpdatedSkill(updatedSkill.id);
      window.profileView.showToast(
        "success",
        "Skill Updated Successfully",
        `“${updatedSkill.name}” is now updated and discoverable on your profile.`
      );
    }, 1200);
  }
}

window.EditSkillModal = EditSkillModal;
