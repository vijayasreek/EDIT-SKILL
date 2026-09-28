/**
 * SkillBridge Form Validation Engine
 */

const ValidationRules = {
  skillName: {
    required: true,
    minLength: 2,
    maxLength: 60,
    validate: (val) => {
      const trimmed = (val || "").trim();
      if (!trimmed) {
        return "Skill name is required. Please provide a clear title.";
      }
      if (trimmed.length < 2) {
        return "Skill name must be at least 2 characters long.";
      }
      if (trimmed.length > 60) {
        return "Skill name cannot exceed 60 characters.";
      }
      return null;
    }
  },
  category: {
    required: true,
    validate: (val) => {
      const trimmed = (val || "").trim();
      if (!trimmed || trimmed === "") {
        return "Please select a category for this skill.";
      }
      return null;
    }
  },
  description: {
    required: true,
    minLength: 15,
    maxLength: 500,
    validate: (val) => {
      const trimmed = (val || "").trim();
      if (!trimmed) {
        return "Skill description is required so learners know what you offer.";
      }
      if (trimmed.length < 15) {
        return `Description is too brief (${trimmed.length}/15 chars). Please explain what you teach or your focus areas.`;
      }
      if (trimmed.length > 500) {
        return `Description cannot exceed 500 characters (${trimmed.length}/500).`;
      }
      return null;
    }
  },
  expertise: {
    required: true,
    validate: (val) => {
      const validLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];
      if (!val || !validLevels.includes(val)) {
        return "Please choose your level of expertise (Beginner, Intermediate, Advanced, or Expert).";
      }
      return null;
    }
  }
};

class FormValidator {
  /**
   * Validates a single field
   * @param {string} fieldName 
   * @param {string} value 
   * @returns {string|null} error message or null if valid
   */
  static validateField(fieldName, value) {
    const rule = ValidationRules[fieldName];
    if (!rule) return null;
    return rule.validate(value);
  }

  /**
   * Validates entire form dataset
   * @param {Object} formData 
   * @returns {Object} { isValid: boolean, errors: { [fieldName]: string } }
   */
  static validateForm(formData) {
    const errors = {};
    let isValid = true;

    for (const [field, rule] of Object.entries(ValidationRules)) {
      const errorMsg = rule.validate(formData[field]);
      if (errorMsg) {
        errors[field] = errorMsg;
        isValid = false;
      }
    }

    return { isValid, errors };
  }

  /**
   * Renders visual error states onto the DOM elements
   * Preserves all user input completely!
   * @param {Object} errors - Map of field names to error messages
   */
  static displayErrors(errors) {
    // Clear existing errors first
    this.clearAllErrors();

    const fieldNames = Object.keys(errors);
    if (fieldNames.length === 0) return;

    let firstInvalidElement = null;

    fieldNames.forEach(fieldName => {
      const errorMsg = errors[fieldName];
      const formGroup = document.querySelector(`[data-field-group="${fieldName}"]`);
      if (!formGroup) return;

      formGroup.classList.add("has-error");

      const feedbackEl = formGroup.querySelector(".input-feedback-error");
      if (feedbackEl) {
        const textSpan = feedbackEl.querySelector(".error-text");
        if (textSpan) {
          textSpan.textContent = errorMsg;
        } else {
          feedbackEl.textContent = errorMsg;
        }
      }

      // Check inputs to set aria-invalid
      const inputEl = formGroup.querySelector("input, select, textarea");
      if (inputEl) {
        inputEl.setAttribute("aria-invalid", "true");
        if (!firstInvalidElement) {
          firstInvalidElement = inputEl;
        }
      }
    });

    // Show error banner in modal
    const alertBanner = document.getElementById("modalAlertBanner");
    if (alertBanner) {
      alertBanner.className = "form-alert-banner alert-danger";
      alertBanner.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" style="flex-shrink:0;">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <div>
          <div class="alert-title">Unable to Save Changes</div>
          <div>Please correct the <strong>${fieldNames.length}</strong> marked error${fieldNames.length > 1 ? "s" : ""} below to proceed.</div>
        </div>
      `;
      alertBanner.style.display = "flex";
    }

    // Accessible focus to first error field
    if (firstInvalidElement) {
      firstInvalidElement.focus();
    }
  }

  /**
   * Clears error for a specific field
   */
  static clearFieldError(fieldName) {
    const formGroup = document.querySelector(`[data-field-group="${fieldName}"]`);
    if (!formGroup) return;

    formGroup.classList.remove("has-error");
    const inputEl = formGroup.querySelector("input, select, textarea");
    if (inputEl) {
      inputEl.removeAttribute("aria-invalid");
    }

    // Check if any errors remain; if none, hide banner
    const remainingErrors = document.querySelectorAll(".form-group.has-error");
    if (remainingErrors.length === 0) {
      const alertBanner = document.getElementById("modalAlertBanner");
      if (alertBanner && !alertBanner.classList.contains("server-error")) {
        alertBanner.style.display = "none";
      }
    }
  }

  /**
   * Clears all validation errors from DOM
   */
  static clearAllErrors() {
    document.querySelectorAll(".form-group.has-error").forEach(group => {
      group.classList.remove("has-error");
      const inputEl = group.querySelector("input, select, textarea");
      if (inputEl) {
        inputEl.removeAttribute("aria-invalid");
      }
    });

    const alertBanner = document.getElementById("modalAlertBanner");
    if (alertBanner && !alertBanner.classList.contains("server-error")) {
      alertBanner.style.display = "none";
    }
  }
}

window.FormValidator = FormValidator;
