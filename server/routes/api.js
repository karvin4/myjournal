const express = require('express');
const router = express.Router();
const { loadStore, saveStore } = require('../config/db');
const { analyzeJournal, chatWithMemories, callLLMApi } = require('../services/aiService');
const { fetchUserProfile, fetchUserCommits, generateMockCommits } = require('../services/githubService');

// Auth endpoints
router.post('/auth/login', (req, res) => {
  const { email } = req.body;
  res.json({
    token: "myjournal_jwt_token_demo",
    user: {
      id: "u-101",
      name: "Alex Morgan",
      email: email || "alex.morgan@example.com",
      memberSince: "July 2026",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
    }
  });
});

router.post('/auth/register', (req, res) => {
  const { name, email } = req.body;
  res.json({
    token: "myjournal_jwt_token_demo",
    user: {
      id: "u-101",
      name: name || "Alex Morgan",
      email: email || "alex.morgan@example.com",
      memberSince: "July 2026",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
    }
  });
});

// GET /api/journal - Fetch all journal entries
router.get('/journal', (req, res) => {
  const store = loadStore();
  res.json(store.journals);
});

// GET /api/journal/:id - Fetch single journal entry
router.get('/journal/:id', (req, res) => {
  const store = loadStore();
  const entry = store.journals.find(j => j.id === req.params.id);
  if (!entry) return res.status(404).json({ error: "Journal entry not found" });
  res.json(entry);
});

// POST /api/journal - Save entry & perform AI Analysis
router.post('/journal', async (req, res) => {
  try {
    const { content, mood, moodEmoji, date, day } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Journal content cannot be empty" });
    }

    const store = loadStore();
    const aiAnalysis = await analyzeJournal(content);

    const newJournalId = "j-" + Date.now();
    const finalDate = date ? new Date(date).toISOString() : new Date().toISOString();
    const finalMood = mood || aiAnalysis.mood || "Happy";
    const finalMoodEmoji = moodEmoji || aiAnalysis.moodEmoji || "😊";

    const newJournal = {
      id: newJournalId,
      date: finalDate,
      day: day || new Date(finalDate).toLocaleDateString('en-US', { weekday: 'long' }),
      content: content.trim(),
      mood: finalMood,
      moodEmoji: finalMoodEmoji,
      goals: aiAnalysis.goals || [],
      achievements: aiAnalysis.achievements || [],
      skills: aiAnalysis.skills || [],
      projects: aiAnalysis.projects || [],
      events: aiAnalysis.events || [],
      ideas: aiAnalysis.ideas || [],
      people: aiAnalysis.people || [],
      tags: aiAnalysis.tags || [],
      summary: aiAnalysis.summary || "Journal reflection recorded."
    };

    store.journals.unshift(newJournal);

    if (aiAnalysis.goals && aiAnalysis.goals.length > 0) {
      aiAnalysis.goals.forEach((gTitle, idx) => {
        store.goals.unshift({
          id: "g-" + Date.now() + "-" + idx,
          title: gTitle,
          createdDate: finalDate,
          status: "In Progress",
          progress: 25,
          priority: "High",
          category: "Personal Growth",
          sourceJournalId: newJournalId
        });
      });
    }

    if (aiAnalysis.achievements && Array.isArray(aiAnalysis.achievements) && aiAnalysis.achievements.length > 0) {
      aiAnalysis.achievements.forEach((achItem, idx) => {
        const title = typeof achItem === 'string' ? achItem : achItem.title;
        const description = typeof achItem === 'object' && achItem.description ? achItem.description : `Extracted from journal reflection on ${new Date(finalDate).toLocaleDateString()}`;
        const category = typeof achItem === 'object' && achItem.category ? achItem.category : "Milestone";

        if (title && title.trim()) {
          store.achievements.unshift({
            id: "a-" + Date.now() + "-" + idx,
            title: title.trim(),
            description: description,
            category: category,
            date: finalDate,
            relatedJournalId: newJournalId,
            createdAt: new Date().toISOString()
          });
        }
      });
    }

    saveStore(store);

    res.status(201).json({
      journal: newJournal,
      analysis: {
        ...aiAnalysis,
        mood: finalMood,
        moodEmoji: finalMoodEmoji
      }
    });
  } catch (error) {
    console.error("Journal save error:", error);
    res.status(500).json({ error: "Failed to process journal entry" });
  }
});

// DELETE /api/journal/:id - Soft delete entry
router.delete('/journal/:id', (req, res) => {
  const store = loadStore();
  const entry = store.journals.find(j => j.id === req.params.id);
  if (!entry) return res.status(404).json({ error: "Journal entry not found" });
  entry.isDeleted = true;
  entry.deletedAt = new Date().toISOString();
  saveStore(store);
  res.json({ message: "Journal entry moved to trash", entry });
});

// POST /api/journal/:id/restore - Restore soft-deleted entry
router.post('/journal/:id/restore', (req, res) => {
  const store = loadStore();
  const entry = store.journals.find(j => j.id === req.params.id);
  if (!entry) return res.status(404).json({ error: "Journal entry not found" });
  entry.isDeleted = false;
  delete entry.deletedAt;
  saveStore(store);
  res.json({ message: "Journal entry restored", entry });
});

// DELETE /api/journal/:id/permanent - Permanent delete entry
router.delete('/journal/:id/permanent', (req, res) => {
  const store = loadStore();
  const index = store.journals.findIndex(j => j.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Journal entry not found" });
  store.journals.splice(index, 1);
  saveStore(store);
  res.json({ message: "Journal entry permanently deleted", id: req.params.id });
});

// POST /api/journal/bulk-delete - Bulk soft delete
router.post('/journal/bulk-delete', (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "Invalid request payload" });
  }
  const store = loadStore();
  const now = new Date().toISOString();
  let count = 0;
  store.journals.forEach(j => {
    if (ids.includes(j.id)) {
      j.isDeleted = true;
      j.deletedAt = now;
      count++;
    }
  });
  saveStore(store);
  res.json({ message: `${count} journal entries moved to trash`, ids });
});

// POST /api/journal/bulk-restore - Bulk restore
router.post('/journal/bulk-restore', (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "Invalid request payload" });
  }
  const store = loadStore();
  let count = 0;
  store.journals.forEach(j => {
    if (ids.includes(j.id)) {
      j.isDeleted = false;
      delete j.deletedAt;
      count++;
    }
  });
  saveStore(store);
  res.json({ message: `${count} journal entries restored`, ids });
});

// POST /api/journal/bulk-permanent-delete - Bulk permanent delete
router.post('/journal/bulk-permanent-delete', (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "Invalid request payload" });
  }
  const store = loadStore();
  const initialLen = store.journals.length;
  store.journals = store.journals.filter(j => !ids.includes(j.id));
  const count = initialLen - store.journals.length;
  saveStore(store);
  res.json({ message: `${count} journal entries permanently deleted`, ids });
});

// GET /api/timeline
router.get('/timeline', (req, res) => {
  const store = loadStore();
  res.json(store.journals);
});

// GET /api/goals
router.get('/goals', (req, res) => {
  const store = loadStore();
  res.json(store.goals);
});

// POST /api/goals - Add custom goal
router.post('/goals', (req, res) => {
  const store = loadStore();
  const { title, priority, category, targetDays, startDate, targetDate } = req.body;

  const finalTargetDays = parseInt(targetDays, 10) || 30;
  const todayStr = new Date().toISOString().split('T')[0];
  const finalStartDate = startDate || todayStr;

  let finalTargetDate = targetDate;
  if (!finalTargetDate) {
    const sDate = new Date(finalStartDate);
    sDate.setDate(sDate.getDate() + finalTargetDays);
    finalTargetDate = sDate.toISOString().split('T')[0];
  }

  const newGoal = {
    id: "g-" + Date.now(),
    title: title || "New Goal",
    createdDate: new Date().toISOString(),
    startDate: finalStartDate,
    targetDate: finalTargetDate,
    targetDays: finalTargetDays,
    completedDates: [],
    status: "In Progress",
    progress: 0,
    priority: priority || "High",
    category: category || "Personal Growth"
  };
  store.goals.unshift(newGoal);
  saveStore(store);
  res.status(201).json(newGoal);
});

// PUT /api/goals/:id - Update goal status/progress
router.put('/goals/:id', (req, res) => {
  const store = loadStore();
  const idx = store.goals.findIndex(g => g.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Goal not found" });

  const updated = { ...store.goals[idx], ...req.body };

  const targetDays = parseInt(updated.targetDays, 10) || 30;
  const completedCount = Array.isArray(updated.completedDates) ? updated.completedDates.length : 0;

  if (updated.status === 'Completed') {
    updated.progress = 100;
  } else if (completedCount >= targetDays) {
    updated.status = 'Completed';
    updated.progress = 100;
  } else {
    updated.progress = Math.min(100, Math.round((completedCount / targetDays) * 100 * 100) / 100);
  }

  store.goals[idx] = updated;
  saveStore(store);
  res.json(store.goals[idx]);
});

// DELETE /api/goals/:id - Delete goal
router.delete('/goals/:id', (req, res) => {
  const store = loadStore();
  store.goals = store.goals.filter(g => g.id !== req.params.id);
  saveStore(store);
  res.json({ message: "Goal deleted successfully" });
});

// GET /api/achievements
router.get('/achievements', (req, res) => {
  const store = loadStore();
  const validJournalIds = new Set(
    (store.journals || [])
      .filter(j => !j.isDeleted)
      .map(j => j.id)
  );

  const activeAchievements = (store.achievements || []).filter(a => {
    if (!a.relatedJournalId) return true;
    return validJournalIds.has(a.relatedJournalId);
  });

  res.json(activeAchievements);
});

// POST /api/chat - Karr Best Friend & Active RAG Engine Endpoint
router.post('/chat', async (req, res) => {
  try {
    const { query, message, botName, history } = req.body;
    const userQuery = message || query;

    if (!userQuery || !userQuery.trim()) {
      return res.status(400).json({ error: "Query or message is required" });
    }

    const store = loadStore();
    const result = await chatWithMemories(userQuery.trim(), store, botName || 'Karr', history || []);

    // Save updated store after Karr actions
    saveStore(store);

    res.json({
      query: userQuery.trim(),
      answer: result.answer,
      intent: result.intent,
      action: result.action,
      updatedGoal: result.updatedGoal || null,
      goals: store.goals,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Chat API error:", error);
    res.status(500).json({ error: "Failed to answer chat question" });
  }
});

// GET /api/weekly-summary
router.get('/weekly-summary', (req, res) => {
  const store = loadStore();
  const journals = store.journals;

  const moodCounts = {};
  journals.forEach(j => {
    moodCounts[j.mood] = (moodCounts[j.mood] || 0) + 1;
  });

  const completedGoals = store.goals.filter(g => g.status === 'Completed').length;
  const totalGoals = store.goals.length;

  res.json({
    period: "Current Week",
    overallMood: "Energetic & Productive",
    overallMoodEmoji: "🚀",
    moodDistribution: moodCounts,
    totalJournals: journals.length,
    achievementsCount: store.achievements.length,
    goalsCompleted: completedGoals,
    goalsTotal: totalGoals,
    growthScore: 92,
    productivityScore: 88,
    challenges: [
      "Balancing frontend UI design refinement with backend API optimization.",
      "Maintaining consistent morning running routine during heavy coding days."
    ],
    lessonsLearned: [
      "Structured prompt engineering delivers vastly superior AI extraction results.",
      "Morning exercise significantly improves focus during long engineering sessions."
    ],
    aiSuggestions: [
      "Keep practicing Machine Learning algorithms for 30 minutes each day.",
      "Celebrate your successful AI project presentation and schedule rest cycles."
    ]
  });
});

// GitHub endpoints
router.get('/github/connection', (req, res) => {
  const store = loadStore();
  res.json(store.githubConnection || { connected: false });
});

router.post('/github/connect', async (req, res) => {
  try {
    const { username, token, isMock } = req.body;
    if (!username && !isMock) {
      return res.status(400).json({ error: "Username is required for GitHub connection" });
    }

    const store = loadStore();

    if (isMock) {
      store.githubConnection = {
        connected: true,
        username: username || 'demo-dev',
        name: 'Demo Developer',
        avatarUrl: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=150&q=80',
        bio: 'Simulated Developer profile for offline local testing.',
        publicRepos: 12,
        htmlUrl: `https://github.com/${username || 'demo-dev'}`,
        isMock: true,
        syncEnabled: true,
        connectedAt: new Date().toISOString()
      };
    } else {
      const profile = await fetchUserProfile(username, token);
      store.githubConnection = {
        connected: true,
        username: profile.username,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
        bio: profile.bio,
        publicRepos: profile.publicRepos,
        htmlUrl: profile.htmlUrl,
        token: token || null,
        isMock: false,
        syncEnabled: true,
        connectedAt: new Date().toISOString()
      };
    }

    saveStore(store);
    res.json(store.githubConnection);
  } catch (error) {
    console.error("Connect GitHub error:", error);
    res.status(500).json({ error: error.message || "Failed to connect to GitHub" });
  }
});

router.post('/github/disconnect', (req, res) => {
  const store = loadStore();
  store.githubConnection = { connected: false };
  saveStore(store);
  res.json({ success: true, message: "Disconnected GitHub account successfully." });
});

router.get('/github/activity', async (req, res) => {
  try {
    const store = loadStore();
    const conn = store.githubConnection;
    if (!conn || !conn.connected) {
      return res.status(400).json({ error: "GitHub account is not connected" });
    }

    if (conn.isMock) {
      const commits = generateMockCommits(conn.username);
      return res.json({ commits, isMock: true });
    }

    try {
      const commits = await fetchUserCommits(conn.username, conn.token);
      res.json({ commits, isMock: false });
    } catch (apiErr) {
      console.warn("Real GitHub API fetch failed, falling back to mock commits:", apiErr.message);
      const commits = generateMockCommits(conn.username);
      res.json({ commits, isMock: true, isFallback: true, error: apiErr.message });
    }
  } catch (error) {
    console.error("Fetch GitHub activity error:", error);
    res.status(500).json({ error: "Failed to fetch GitHub activity" });
  }
});

router.post('/github/import-reflection', async (req, res) => {
  try {
    const { commits } = req.body;
    if (!commits || !Array.isArray(commits) || commits.length === 0) {
      return res.status(400).json({ error: "No commits selected for reflection" });
    }

    const commitListStr = commits.map(c => `- [${c.repo}] ${c.message} (${new Date(c.date).toLocaleDateString()})`).join('\n');
    const prompt = `Write a highly encouraging, reflective daily journal entry (approx 200-250 words) from a developer's perspective summarizing and reflecting on the following GitHub commits:
${commitListStr}

Include:
- How these contributions move their project forward.
- Express positive feelings (e.g. productive, fulfilled, or excited) about code refactoring, features, or fixes.
- End with 1-2 goals or next steps for tomorrow based on this code activity.

Write ONLY the journal entry text, with no extra intro/outro text, no backticks, and no HTML.`;

    let generatedText = '';
    const llmResponse = await callLLMApi(prompt);

    if (llmResponse) {
      generatedText = llmResponse.trim();
    } else {
      // Very high quality fallback text generation if LLM is not active or key is missing
      const moodWords = ["productive", "energetic", "focused"];
      const selectedMood = moodWords[Math.floor(Math.random() * moodWords.length)];
      generatedText = `Today was a really ${selectedMood} coding day! I made significant progress on my software projects by pushing several updates to GitHub. Specifically:\n\n` +
        commits.map(c => `• In **${c.repo}**, I worked on: *"${c.message}"*.`).join('\n') +
        `\n\nIt feels great to check these tasks off my list. Refactoring code, optimizing layouts, and resolving backend logic always gives me a sense of accomplishment. Tomorrow, I plan to build on this momentum, finalize remaining integration details, and verify overall build performance. Keep building! 🚀`;
    }

    res.json({ reflection: generatedText });
  } catch (error) {
    console.error("Import reflection error:", error);
    res.status(500).json({ error: "Failed to generate reflection from GitHub commits" });
  }
});

module.exports = router;
