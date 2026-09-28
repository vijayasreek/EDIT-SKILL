/**
 * SkillBridge Application State Management
 */

const INITIAL_SKILLS = [
  {
    id: "skill-101",
    name: "Python Programming",
    category: "Programming",
    description: "I teach Python fundamentals, problem solving, and beginner-level project development.",
    expertise: "Advanced",
    tags: ["Python", "Problem Solving", "APIs", "Clean Code"],
    learnersCount: 28,
    rating: 4.9,
    reviewsCount: 34,
    availableForSwap: true,
    lastUpdated: "Oct 14, 2025",
    isPrimaryTarget: true
  },
  {
    id: "skill-102",
    name: "UI/UX & Product Design",
    category: "Design & Creative",
    description: "End-to-end design sprints, wireframing, high-fidelity Figma components, and usability heuristics.",
    expertise: "Intermediate",
    tags: ["Figma", "Design Systems", "Prototyping", "UX Heuristics"],
    learnersCount: 19,
    rating: 4.8,
    reviewsCount: 16,
    availableForSwap: true,
    lastUpdated: "Sep 28, 2025"
  },
  {
    id: "skill-103",
    name: "Cloud Architecture & DevOps",
    category: "DevOps & Cloud",
    description: "Containerization with Docker, Kubernetes clustering, CI/CD pipeline automation, and AWS infrastructure.",
    expertise: "Expert",
    tags: ["AWS", "Docker", "Kubernetes", "CI/CD"],
    learnersCount: 32,
    rating: 5.0,
    reviewsCount: 29,
    availableForSwap: false,
    lastUpdated: "Aug 12, 2025"
  },
  {
    id: "skill-104",
    name: "Acoustic Guitar Fundamentals",
    category: "Music & Arts",
    description: "Fingerpicking patterns, open chord progressions, rhythmic strumming, and ear training for beginners.",
    expertise: "Beginner",
    tags: ["Acoustic Guitar", "Chords", "Music Theory", "Rhythm"],
    learnersCount: 8,
    rating: 4.7,
    reviewsCount: 7,
    availableForSwap: true,
    lastUpdated: "Jun 04, 2025"
  }
];

const CATEGORIES = [
  { id: "Programming", label: "Programming & Development" },
  { id: "Design & Creative", label: "Design & Creative" },
  { id: "DevOps & Cloud", label: "DevOps & Cloud Infrastructure" },
  { id: "Music & Arts", label: "Music & Performing Arts" },
  { id: "Data & AI", label: "Data Science & Artificial Intelligence" },
  { id: "Languages", label: "Languages & Linguistics" },
  { id: "Business", label: "Business & Entrepreneurship" }
];

const EXPERTISE_LEVELS = [
  {
    id: "Beginner",
    title: "Beginner",
    icon: "🌱",
    summary: "Foundations, core syntax, learning essentials"
  },
  {
    id: "Intermediate",
    title: "Intermediate",
    icon: "🌿",
    summary: "Practical projects, debugging, real-world flow"
  },
  {
    id: "Advanced",
    title: "Advanced",
    icon: "⚡",
    summary: "Deep mastery, complex architectures, mentoring"
  },
  {
    id: "Expert",
    title: "Expert",
    icon: "👑",
    summary: "Industry authority, optimization, thought leadership"
  }
];

class StateManager {
  constructor() {
    this.skills = JSON.parse(JSON.stringify(INITIAL_SKILLS));
    this.currentEditingSkillId = null;
    this.initialFormData = null;
    this.activeFilter = "All";
    this.searchQuery = "";
    this.simulations = {
      simulateLoadError: false,
      simulateSaveError: false,
      slowNetwork: false,
      simulatedLatency: 700
    };
    this.activePreset = 1;
    this.theme = localStorage.getItem("skillbridge_theme") || "dark";
  }

  getSkillById(id) {
    return this.skills.find(s => s.id === id);
  }

  updateSkill(id, updatedData) {
    const index = this.skills.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error(`Skill with ID ${id} not found.`);
    }

    const currentSkill = this.skills[index];
    this.skills[index] = {
      ...currentSkill,
      ...updatedData,
      lastUpdated: "Just now",
      justUpdated: true
    };

    return this.skills[index];
  }

  resetDemoData() {
    this.skills = JSON.parse(JSON.stringify(INITIAL_SKILLS));
    return this.skills;
  }
}

window.appState = new StateManager();
