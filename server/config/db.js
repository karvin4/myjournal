const fs = require('fs');
const path = require('path');

// Persistent JSON file fallback path when MongoDB URI is not configured
const DATA_FILE = path.join(__dirname, '..', 'data', 'store.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initial seed data
const initialData = {
  journals: [
    {
      id: "j-1",
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      content: "Today I completed my AI project presentation. I also started learning Machine Learning basics on Coursera. I'm excited because my presentation went really well and my professor loved the demo!",
      mood: "Happy",
      moodEmoji: "😊",
      goals: ["Learn Machine Learning"],
      achievements: ["Completed AI Project Presentation"],
      skills: ["Artificial Intelligence", "Public Speaking"],
      projects: ["MyJournal AI"],
      events: ["Project Presentation"],
      ideas: ["Build an AI memory graph visualizer"],
      people: ["Professor Smith"],
      tags: ["AI", "Milestone", "Learning"],
      summary: "Completed AI project presentation successfully and started learning Machine Learning."
    },
    {
      id: "j-2",
      date: new Date(Date.now() - 86400000 * 1).toISOString(),
      content: "Spent 4 hours refactoring the frontend using React and Vite. Focused on adding dark mode and smooth CSS glassmorphic cards. Had a coffee chat with Sarah about user experience design.",
      mood: "Productive",
      moodEmoji: "⚡",
      goals: ["Master Glassmorphism UI", "Complete Frontend MVP"],
      achievements: ["Refactored React Architecture"],
      skills: ["React", "CSS Architecture"],
      projects: ["MyJournal SaaS"],
      events: ["Coffee Chat with Sarah"],
      ideas: ["Add voice memo input to journal"],
      people: ["Sarah"],
      tags: ["Frontend", "React", "Design"],
      summary: "Refactored React app frontend, added glassmorphic dark mode, and discussed UX with Sarah."
    },
    {
      id: "j-3",
      date: new Date().toISOString(),
      content: "Woke up early and ran 5 kilometers in the park. Feel super energetic! Later worked on backend REST APIs for MyJournal using Node.js and Express. Integrated Gemini AI prompt memory retrieval.",
      mood: "Energetic",
      moodEmoji: "🔥",
      goals: ["Run 5km 3x a week", "Deploy MyJournal Backend"],
      achievements: ["Ran 5km morning workout", "Built Gemini RAG Engine"],
      skills: ["Node.js", "Express", "REST APIs", "Fitness"],
      projects: ["Health", "MyJournal AI"],
      events: ["Morning 5k Run"],
      ideas: ["Automate weekly AI summary generation"],
      people: [],
      tags: ["Health", "Backend", "Nodejs"],
      summary: "Completed a 5km morning run and implemented Node.js REST API with Gemini RAG memory chat."
    }
  ],
  goals: [
    {
      id: "g-1",
      title: "Learn Machine Learning",
      createdDate: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: "In Progress",
      progress: 40,
      priority: "High",
      category: "Learning",
      sourceJournalId: "j-1"
    },
    {
      id: "g-2",
      title: "Master Glassmorphism UI",
      createdDate: new Date(Date.now() - 86400000 * 1).toISOString(),
      status: "In Progress",
      progress: 75,
      priority: "Medium",
      category: "Design",
      sourceJournalId: "j-2"
    },
    {
      id: "g-3",
      title: "Run 5km 3x a week",
      createdDate: new Date().toISOString(),
      status: "In Progress",
      progress: 60,
      priority: "High",
      category: "Health",
      sourceJournalId: "j-3"
    },
    {
      id: "g-4",
      title: "Complete AI Project Presentation",
      createdDate: new Date(Date.now() - 86400000 * 5).toISOString(),
      status: "Completed",
      progress: 100,
      priority: "High",
      category: "Academic",
      sourceJournalId: "j-1"
    }
  ],
  achievements: [
    {
      id: "a-1",
      title: "Completed AI Project Presentation",
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      relatedJournalId: "j-1",
      category: "Academic",
      description: "Successfully presented the AI project and received high praise from Professor Smith."
    },
    {
      id: "a-2",
      title: "Refactored React Architecture",
      date: new Date(Date.now() - 86400000 * 1).toISOString(),
      relatedJournalId: "j-2",
      category: "Engineering",
      description: "Upgraded frontend state architecture and built dark mode glassmorphic component system."
    },
    {
      id: "a-3",
      title: "Ran 5km morning workout",
      date: new Date().toISOString(),
      relatedJournalId: "j-3",
      category: "Health",
      description: "Achieved new personal morning run consistency goal."
    },
    {
      id: "a-4",
      title: "Built Gemini RAG Engine",
      date: new Date().toISOString(),
      relatedJournalId: "j-3",
      category: "Engineering",
      description: "Engineered memory retrieval context pipeline for MyJournal AI chat."
    }
  ]
};

// Initialize file if not existing
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
}

function loadStore() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return initialData;
  }
}

function saveStore(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = {
  loadStore,
  saveStore
};
