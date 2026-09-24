const https = require('https');

// Helper to match mood & emoji from content text
function detectMood(text) {
  const lower = text.toLowerCase();
  if (lower.includes('excited') || lower.includes('happy') || lower.includes('loved') || lower.includes('awesome') || lower.includes('great')) {
    return { mood: 'Happy', emoji: '😊' };
  }
  if (lower.includes('energetic') || lower.includes('run') || lower.includes('workout') || lower.includes('fire')) {
    return { mood: 'Energetic', emoji: '🔥' };
  }
  if (lower.includes('productive') || lower.includes('completed') || lower.includes('built') || lower.includes('refactored')) {
    return { mood: 'Productive', emoji: '⚡' };
  }
  if (lower.includes('tired') || lower.includes('exhausted') || lower.includes('hard')) {
    return { mood: 'Reflective', emoji: '💭' };
  }
  if (lower.includes('anxious') || lower.includes('nervous') || lower.includes('stressed')) {
    return { mood: 'Thoughtful', emoji: '🧠' };
  }
  return { mood: 'Fulfilled', emoji: '✨' };
}

// Fallback high-accuracy structured heuristic extractor for journal entries
function fallbackExtraction(content) {
  const { mood, emoji } = detectMood(content);
  const lower = content.toLowerCase();

  const goals = [];
  const achievements = [];
  const skills = [];
  const projects = [];
  const events = [];
  const ideas = [];
  const people = [];
  const tags = [];

  if (lower.includes('start') || lower.includes('learning') || lower.includes('goal') || lower.includes('want to') || lower.includes('plan')) {
    if (lower.includes('machine learning') || lower.includes('ml')) goals.push("Learn Machine Learning");
    if (lower.includes('react') || lower.includes('frontend')) goals.push("Master Frontend React");
    if (lower.includes('5k') || lower.includes('run')) goals.push("Maintain 5km Running Habit");
  }
  if (goals.length === 0) {
    goals.push("Continue personal growth & consistency");
  }

  if (lower.includes('completed') || lower.includes('finished') || lower.includes('achieved') || lower.includes('won') || lower.includes('built') || lower.includes('fixed') || lower.includes('passed') || lower.includes('breakthrough')) {
    const sentences = content.split(/[.!?]/).filter(Boolean);
    for (const s of sentences) {
      const trimmed = s.trim();
      const sLower = trimmed.toLowerCase();
      if (sLower.includes('completed') || sLower.includes('built') || sLower.includes('fixed') || sLower.includes('passed') || sLower.includes('won') || sLower.includes('achieved')) {
        achievements.push({
          title: trimmed.length > 70 ? trimmed.slice(0, 67) + '...' : trimmed,
          description: `Extracted from journal reflection`,
          category: "Milestone"
        });
        break;
      }
    }
  }

  if (lower.includes('ai') || lower.includes('machine learning')) skills.push("AI / Machine Learning");
  if (lower.includes('react') || lower.includes('vite') || lower.includes('css')) skills.push("React & CSS Architecture");
  if (lower.includes('node') || lower.includes('express') || lower.includes('api')) skills.push("Node.js & REST APIs");
  if (lower.includes('run') || lower.includes('workout')) skills.push("Fitness & Endurance");

  if (lower.includes('myjournal') || lower.includes('journal')) projects.push("MyJournal AI App");
  if (lower.includes('ai project')) projects.push("Academic AI Project");

  if (lower.includes('presentation')) events.push("Presentation Demo");
  if (lower.includes('coffee chat')) events.push("Coffee Chat");

  if (lower.includes('idea') || lower.includes('thought') || lower.includes('visualizer')) {
    ideas.push("Build an AI memory graph visualizer");
  }

  const names = ["Sarah", "Professor Smith", "Alex", "David", "Emma", "John"];
  for (const n of names) {
    if (content.includes(n)) people.push(n);
  }

  if (skills.length > 0) tags.push(...skills.slice(0, 2));
  if (projects.length > 0) tags.push(projects[0]);
  if (tags.length === 0) tags.push("Journal", "Reflection");

  const summary = content.length > 100 ? content.slice(0, 110) + "..." : content;

  return {
    mood,
    moodEmoji: emoji,
    goals,
    achievements,
    skills,
    projects,
    events,
    ideas,
    people,
    tags: Array.from(new Set(tags)),
    summary
  };
}

// API Call helper supporting OpenAI API key or Gemini API key
async function callLLMApi(prompt) {
  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (openaiKey) {
    return new Promise((resolve) => {
      const data = JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are Karr, a warm, supportive best friend, thoughtful coach, journal companion and goal manager inside MyJournal app." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      });

      const options = {
        hostname: 'api.openai.com',
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            resolve(parsed?.choices?.[0]?.message?.content || null);
          } catch (e) { resolve(null); }
        });
      });
      req.on('error', () => resolve(null));
      req.write(data);
      req.end();
    });
  }

  if (geminiKey) {
    return new Promise((resolve) => {
      const data = JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      });

      const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            resolve(parsed?.candidates?.[0]?.content?.parts?.[0]?.text || null);
          } catch (e) { resolve(null); }
        });
      });
      req.on('error', () => resolve(null));
      req.write(data);
      req.end();
    });
  }

  return null;
}

// AI Extraction Service
async function analyzeJournal(content) {
  const prompt = `Analyze this journal entry and return ONLY a raw JSON object (no markdown, no backticks):
Journal Content: "${content}"

Required JSON Structure:
{
  "mood": "Happy | Productive | Energetic | Reflective | Thoughtful | Fulfilled",
  "moodEmoji": "😊 | ⚡ | 🔥 | 💭 | 🧠 | ✨",
  "goals": ["string"],
  "achievements": [
    {
      "title": "Short title of victory or milestone",
      "description": "1 sentence detail of accomplishment",
      "category": "Academic | Engineering | Personal | Health | Career | Milestone"
    }
  ],
  "skills": ["string"],
  "projects": ["string"],
  "events": ["string"],
  "ideas": ["string"],
  "people": ["string"],
  "tags": ["string"],
  "summary": "1-2 sentence concise summary"
}

IMPORTANT CRITERIA FOR ACHIEVEMENTS:
Only include items in 'achievements' if the journal explicitly describes a meaningful milestone, personal victory, breakthrough, key accomplishment, or major progress (e.g. completing a presentation, passing an exam, fixing a major architecture issue, launching a project, winning a challenge).
Do NOT generate achievements for routine, ordinary daily activities (e.g. 'went to class', 'had lunch', 'ordinary day').
If no meaningful milestone or victory exists in the journal entry, set 'achievements' to an empty array [].`;

  const result = await callLLMApi(prompt);
  if (result) {
    try {
      const cleanJson = result.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      console.warn("LLM parse failed, using structured fallback extraction.");
    }
  }

  return fallbackExtraction(content);
}

// ----------------------------------------------------
// KARR: Best Friend Persona & Active RAG Engine
// ----------------------------------------------------
function processKarrIntent(query, store, botName = 'Karr') {
  const qLower = query.toLowerCase().trim();

  // Ensure store arrays & memory state exist
  if (!store.goals) store.goals = [];
  if (!store.achievements) store.achievements = [];
  if (!store.journals) store.journals = [];
  if (!store.habits) store.habits = [];
  if (!store.memories) store.memories = [];
  if (!store.moods) store.moods = [];

  // Track nickname tone from message
  let currentToneWord = null;
  if (/\b(macha)\b/i.test(qLower)) currentToneWord = "macha";
  else if (/\b(bro)\b/i.test(qLower)) currentToneWord = "bro";
  else if (/\b(dude)\b/i.test(qLower)) currentToneWord = "dude";
  else if (/\b(buddy)\b/i.test(qLower)) currentToneWord = "buddy";
  else if (/\b(mate)\b/i.test(qLower)) currentToneWord = "mate";

  if (currentToneWord) {
    store.userNickname = currentToneWord;
  }

  const activeName = store.userNickname || "";
  const nameSuffix = activeName ? ` ${activeName}` : "";

  // Check if query is an information question / inquiry (starts with or contains question indicators)
  const isQuestion = /\b(what|whats|what's|how|show|list|tell|which|where|when|why|do i|have i|can you)\b/i.test(qLower);

  // Helper to extract clean titles
  const extractCleanTitle = (text, verbRegexes) => {
    for (const r of verbRegexes) {
      const match = text.match(r);
      if (match && match[1]) {
        let title = match[1].replace(/^(a|an|the|my|to|from|some|that)\s+/i, '').replace(/[.!?]/g, '').trim();
        if (title.length > 1) {
          return title.charAt(0).toUpperCase() + title.slice(1);
        }
      }
    }
    return null;
  };

  // 0. NICKNAME CHANGE DIRECTIVE ("call me Captain", "call me bro", etc.)
  const callMeMatch = query.match(/\b(?:call me|my name is)\s+([^.!?]+)/i);
  if (callMeMatch && callMeMatch[1]) {
    const newNick = callMeMatch[1].trim();
    store.userNickname = newNick;
    return {
      answer: `Haha, got it ${newNick} 😄`,
      intent: 'nickname_update',
      action: { action: 'set_nickname', nickname: newNick }
    };
  }

  // 1. IDENTITY QUESTIONS ("what's your name", "who are you")
  if (/\b(what's your name|what is your name|who are you|who is karr)\b/i.test(qLower)) {
    if (qLower.includes("what's your name") || qLower.includes("what is your name")) {
      return {
        answer: `I'm ${botName} 😊\n\nThink of me as your journal buddy, goal partner and someone who's always got your back.`,
        intent: 'identity_question',
        action: { action: 'none' }
      };
    }
    return {
      answer: `I'm ${botName} 😄\n\nPart best friend, part goal manager and part journal companion.\n\nBasically... the friend that remembers everything.`,
      intent: 'identity_question',
      action: { action: 'none' }
    };
  }

  // If query is an information question, defer to Active RAG Engine!
  if (isQuestion) {
    return null;
  }

  // 2. UNCERTAIN GOALS
  if (/\b(think i should|maybe i'll|maybe i will|kinda want to|kind of want to|considering|thinking about|wondering if i should)\b/i.test(qLower)) {
    const topic = extractCleanTitle(query, [
      /\b(?:think i should|maybe i'll|maybe i will|kinda want to|kind of want to|considering|thinking about)\s+(?:learning|starting|reading|doing|making|building|practicing|to)?\s*([^.!?]+)/i
    ]) || "Learn Java";

    return {
      answer: `That actually sounds like a pretty good goal 😊\n\nWant me to add '${topic}' to your Goal Tracker${nameSuffix}?`,
      intent: 'goal_uncertain',
      action: { action: 'ask_confirmation', title: topic }
    };
  }

  // 3. GOAL COMPLETION
  if (/\b(finished|completed|done with|reached my goal|achieved my goal|completed the goal)\b/i.test(qLower)) {
    const matchedGoal = store.goals.find(g =>
      g.status !== 'Completed' &&
      (qLower.includes(g.title.toLowerCase()) || g.title.toLowerCase().split(' ').some(w => w.length > 3 && qLower.includes(w)))
    ) || store.goals.find(g => g.status !== 'Completed');

    if (matchedGoal) {
      matchedGoal.status = 'Completed';
      matchedGoal.progress = 100;
      return {
        answer: `Let's goooo${nameSuffix}! 🎉\n\nThat's officially completed. I'm seriously proud of you.`,
        intent: 'goal_completion',
        action: { action: 'complete_goal', title: matchedGoal.title },
        updatedGoal: matchedGoal
      };
    }

    const title = extractCleanTitle(query, [
      /\b(?:finished|completed|done with)\s+([^.!?]+)/i
    ]) || "Goal";

    return {
      answer: `Let's goooo${nameSuffix}! 🎉\n\nThat's officially completed. I'm seriously proud of you.`,
      intent: 'goal_completion',
      action: { action: 'complete_goal', title }
    };
  }

  // 4. GOAL UPDATE / RENAME
  if (/\b(instead of|replace|change my goal|rename goal|switch goal)\b/i.test(qLower)) {
    const parts = query.split(/\b(?:instead of|replace|with|to|change to)\b/i);
    let oldTitle = null;
    let newTitle = null;

    if (parts.length >= 2) {
      newTitle = parts[1].replace(/["']/g, '').trim();
      oldTitle = parts[0].replace(/["']/g, '').replace(/change my goal|replace|rename/gi, '').trim();
    }

    const targetGoal = store.goals.find(g =>
      (oldTitle && g.title.toLowerCase().includes(oldTitle.toLowerCase())) ||
      qLower.includes(g.title.toLowerCase())
    ) || store.goals[0];

    if (targetGoal && newTitle) {
      const prevTitle = targetGoal.title;
      targetGoal.title = newTitle.charAt(0).toUpperCase() + newTitle.slice(1);
      return {
        answer: `Ooo love that pivot! ✨\n\nSwitched your goal to "${targetGoal.title}". Let's make it happen${nameSuffix}.`,
        intent: 'goal_update',
        action: { action: 'update_goal', oldTitle: prevTitle, title: targetGoal.title },
        updatedGoal: targetGoal
      };
    }
  }

  // 5. GOAL DELETION
  if (/\b(don't want this goal|delete my goal|delete goal|remove goal|drop this goal|dropping this|cancel goal)\b/i.test(qLower)) {
    const matchedGoal = store.goals.find(g => qLower.includes(g.title.toLowerCase()));
    if (matchedGoal) {
      store.goals = store.goals.filter(g => g.id !== matchedGoal.id);
      return {
        answer: `Got it! Removed "${matchedGoal.title}" from your tracker. No stress at all${nameSuffix} — focus on what matters to you right now.`,
        intent: 'goal_deletion',
        action: { action: 'delete_goal', title: matchedGoal.title }
      };
    } else if (store.goals.length > 0) {
      const removed = store.goals.shift();
      return {
        answer: `Got it! Removed "${removed.title}" from your tracker. No stress at all ✨`,
        intent: 'goal_deletion',
        action: { action: 'delete_goal', title: removed.title }
      };
    }
  }

  // 6. GOAL CREATION (COMMITMENT)
  if (/\b(gonna learn|going to learn|will learn|gonna start|going to start|will start|my next target is|need to master|i'll start|i'm learning|i'll read|i'm quitting|i'll practice|i'm going to|add goal)\b/i.test(qLower)) {
    let rawTitle = extractCleanTitle(query, [
      /\b(?:gonna learn|going to learn|will learn|gonna start|going to start|will start|my next target is|need to master|i'll start|i'm learning|i'll read|i'm quitting|i'll practice|i'm going to|add goal)\s+(?:from today|starting today|now|soon)?\s*([^.!?]+)/i,
      /\b(?:gonna|going to|will)\s+([^.!?]+)/i
    ]);

    if (!rawTitle || rawTitle.length < 2) {
      if (qLower.includes('java')) rawTitle = "Learn Java";
      else if (qLower.includes('python')) rawTitle = "Learn Python";
      else if (qLower.includes('react')) rawTitle = "Learn React";
      else if (qLower.includes('gym')) rawTitle = "Gym Workout";
      else rawTitle = "New Goal";
    }

    let title = rawTitle;
    if (qLower.includes('java') && !title.toLowerCase().includes('java')) title = "Learn Java";
    if (qLower.includes('react') && !title.toLowerCase().includes('react')) title = "Learn React";
    if (qLower.includes('python') && !title.toLowerCase().includes('python')) title = "Learn Python";
    if (qLower.includes('gym') && !title.toLowerCase().includes('gym')) title = "Gym Workout";

    if (!title.toLowerCase().startsWith('learn') && !title.toLowerCase().startsWith('read') && !title.toLowerCase().startsWith('quit') && !title.toLowerCase().startsWith('practice') && !title.toLowerCase().startsWith('gym') && !title.toLowerCase().startsWith('master') && !title.toLowerCase().startsWith('new')) {
      title = "Learn " + title;
    }

    const newGoalObj = {
      id: 'g-' + Date.now(),
      title: title,
      createdDate: new Date().toISOString(),
      status: 'In Progress',
      progress: 0,
      priority: 'High',
      category: qLower.includes('gym') || qLower.includes('run') || qLower.includes('workout') ? 'Fitness' : 'Learning'
    };

    store.goals.unshift(newGoalObj);

    return {
      answer: `Yesss 🔥\n\n${title} sounds like a solid move.\n\nI've added it to your Goal Tracker${nameSuffix}.\n\nLet's crush it one step at a time.`,
      intent: 'goal_creation',
      action: { action: 'create_goal', title: title, category: newGoalObj.category, priority: 'High' },
      updatedGoal: newGoalObj
    };
  }

  // 7. HABIT DETECTION
  if (/\b(i'll wake up|wake up at|i'll drink|drink more water|meditate daily|walk every|i'll walk|daily habit|every day|every morning|every evening)\b/i.test(qLower)) {
    const habitTitle = extractCleanTitle(query, [
      /\b(?:i'll|will|gonna)\s+(wake up at \d+|drink more water|meditate daily|walk every \w+|[^.!?]+)/i
    ]) || "Daily Habit";

    const habitObj = {
      id: 'h-' + Date.now(),
      title: habitTitle,
      createdDate: new Date().toISOString(),
      type: 'habit'
    };
    store.habits.push(habitObj);

    return {
      answer: `Ooo that's a great habit to build 😄\n\nI've logged '${habitTitle}' into your habits${nameSuffix}. Small steps lead to big wins!`,
      intent: 'habit',
      action: { action: 'create_habit', title: habitTitle }
    };
  }

  // 8. ACHIEVEMENTS & EXAM PASSES
  if (/\b(i got placed|won first prize|scored \d+|completed my internship|got the job|passed my exam|passed exam|won a competition|cleared interview)\b/i.test(qLower)) {
    const achTitle = query.replace(/^(i|today i|finally)\s+/i, '').trim();
    const achObj = {
      id: 'a-' + Date.now(),
      title: achTitle.charAt(0).toUpperCase() + achTitle.slice(1),
      date: new Date().toISOString(),
      category: 'Milestone'
    };
    store.achievements.unshift(achObj);

    return {
      answer: `Let's goooo${nameSuffix}!! 🔥\n\nThat's awesome! I've saved "${achObj.title}" right into your achievements!`,
      intent: 'achievement',
      action: { action: 'add_achievement', title: achObj.title }
    };
  }

  // 9. MOOD STATEMENT & EMOTIONAL EXPRESSION
  if (/\b(exhausted|feeling amazing|feel lonely|feeling stressed|feeling anxious|feeling sad|feeling depressed|feeling overwhelmed|feeling drained|feeling super excited)\b/i.test(qLower)) {
    const moodObj = {
      date: new Date().toISOString(),
      text: query
    };
    store.moods.push(moodObj);

    if (qLower.includes('exhausted') || qLower.includes('drained') || qLower.includes('tired')) {
      return {
        answer: `Take it easy${nameSuffix}.\n\nLong day? Make sure to get some good rest tonight.`,
        intent: 'mood',
        action: { action: 'store_mood', mood: 'Tired' }
      };
    }
    if (qLower.includes('lonely') || qLower.includes('sad') || qLower.includes('depressed')) {
      return {
        answer: `I'm right here with you${nameSuffix}. What's on your mind?`,
        intent: 'mood',
        action: { action: 'store_mood', mood: 'Sad' }
      };
    }
    if (qLower.includes('stressed') || qLower.includes('anxious') || qLower.includes('overwhelmed')) {
      return {
        answer: `Take a deep breath${nameSuffix} 🧘‍♂️ You don't have to figure everything out all at once. What's causing the pressure right now?`,
        intent: 'mood',
        action: { action: 'store_mood', mood: 'Stressed' }
      };
    }
    if (qLower.includes('amazing') || qLower.includes('happy') || qLower.includes('super excited')) {
      return {
        answer: `Ooo I love this energy${nameSuffix}! 😄 What made today feel so awesome?`,
        intent: 'mood',
        action: { action: 'store_mood', mood: 'Happy' }
      };
    }
  }

  // 10. MEMORY SAVING STATEMENT
  if (/\b(my favorite sport is|my favorite movie is|my favorite food is|i prefer|remind me that i love|remember that i)\b/i.test(qLower)) {
    store.memories.push({ text: query, date: new Date().toISOString() });
    return {
      answer: `Noted${nameSuffix}! I'll definitely keep that in memory 😄`,
      intent: 'memory',
      action: { action: 'save_memory', memory: query }
    };
  }

  // 11. GREETINGS (Anchored greeting-only check)
  if (/^(hi|hello|hey|hii|yo|sup|good morning|good evening|yooo)(\s+(macha|bro|dude|buddy|mate|karr|friend))?[\s!.,?]*$/i.test(qLower)) {
    const greetings = [
      `Hey${nameSuffix} 😄 Good to see you! What's on your mind today?`,
      `Yooo${nameSuffix}! How's your day going?`,
      `Good to see you again${nameSuffix}! What would you like to reflect on or check today?`,
      `Hey! What's happening today${nameSuffix}?`
    ];
    const pickIndex = (query.length + Date.now()) % greetings.length;
    return {
      answer: greetings[pickIndex],
      intent: 'greeting',
      action: { action: 'none' }
    };
  }

  // Default: Return null to allow Active RAG Engine to process the question
  return null;
}

// ----------------------------------------------------
// ACTIVE RAG: Store Retrieval & Synthesis Engine
// ----------------------------------------------------
function retrieveRAGContext(query, store) {
  const qLower = query.toLowerCase().trim();

  const isGoalsQuery = /\b(goal|goals|target|targets|plan|plans)\b/i.test(qLower);
  const isRecentQuery = /\b(recent|recently|latest|write|wrote|journal|journals|entry|entries|reflections|past|yesterday|today)\b/i.test(qLower);
  const isProgressQuery = /\b(progress|progressing|growth|doing|achieve|achievements|accomplish|accomplishments|milestones|track)\b/i.test(qLower);
  const isHabitQuery = /\b(habit|habits|routine|routines|daily)\b/i.test(qLower);

  const activeGoals = (store.goals || []).filter(g => g.status !== 'Completed');
  const completedGoals = (store.goals || []).filter(g => g.status === 'Completed');
  const journals = (store.journals || []).filter(j => !j.isDeleted);
  const achievements = store.achievements || [];
  const habits = store.habits || [];
  const memories = store.memories || [];

  // Stop words for keyword search
  const stopWords = new Set(['what', 'whats', 'what\'s', 'is', 'my', 'the', 'a', 'an', 'i', 'did', 'tell', 'me', 'about', 'how', 'am', 'something', 'any', 'can', 'you', 'show', 'list', 'are']);
  const keywords = qLower.split(/[\s,?.!]+/).filter(w => w.length > 2 && !stopWords.has(w));

  // Score journals based on keyword match or recency
  const scoredJournals = journals.map(j => {
    let score = 0;
    const contentLower = (j.content || '').toLowerCase();
    const summaryLower = (j.summary || '').toLowerCase();
    const tagsLower = (j.tags || []).join(' ').toLowerCase();

    keywords.forEach(kw => {
      if (contentLower.includes(kw)) score += 3;
      if (summaryLower.includes(kw)) score += 2;
      if (tagsLower.includes(kw)) score += 2;
    });

    return { journal: j, score };
  });

  scoredJournals.sort((a, b) => b.score - a.score || new Date(b.journal.date) - new Date(a.journal.date));

  const relevantJournals = isRecentQuery || scoredJournals.some(s => s.score > 0)
    ? scoredJournals.filter(s => isRecentQuery || s.score > 0).slice(0, 5).map(s => s.journal)
    : (journals.length > 0 ? journals.slice(0, 3) : []);

  const hasRelevantData = (isGoalsQuery && store.goals.length > 0) ||
                          (isRecentQuery && journals.length > 0) ||
                          (isProgressQuery && (store.goals.length > 0 || achievements.length > 0 || journals.length > 0)) ||
                          (isHabitQuery && habits.length > 0) ||
                          scoredJournals.some(s => s.score > 0);

  // Format context string for LLM Prompt
  let contextParts = [];

  if (store.goals && store.goals.length > 0) {
    let goalsStr = "[Stored Goals]:\n";
    store.goals.forEach(g => {
      goalsStr += `- Goal: "${g.title}" | Status: ${g.status} | Progress: ${g.progress}% | Category: ${g.category || 'General'}\n`;
    });
    contextParts.push(goalsStr);
  }

  if (relevantJournals.length > 0) {
    let jStr = "[Recent / Relevant Journal Entries]:\n";
    relevantJournals.forEach((j, idx) => {
      const d = new Date(j.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      jStr += `- Entry ${idx + 1} (${d}, Mood: ${j.mood || 'Reflective'} ${j.moodEmoji || '💭'}): "${j.content || j.summary}"\n`;
    });
    contextParts.push(jStr);
  }

  if (achievements.length > 0) {
    let achStr = "[Logged Achievements & Milestones]:\n";
    achievements.slice(0, 5).forEach(a => {
      const d = a.date ? new Date(a.date).toLocaleDateString() : '';
      achStr += `- Achievement: "${a.title}" (${a.category || 'Milestone'}${d ? ' on ' + d : ''})\n`;
    });
    contextParts.push(achStr);
  }

  if (habits.length > 0) {
    let habStr = "[Daily Habits]:\n";
    habits.forEach(h => {
      habStr += `- Habit: "${h.title}"\n`;
    });
    contextParts.push(habStr);
  }

  if (memories.length > 0) {
    let memStr = "[Saved User Memories]:\n";
    memories.slice(0, 5).forEach(m => {
      memStr += `- Memory: "${m.text}"\n`;
    });
    contextParts.push(memStr);
  }

  return {
    found: hasRelevantData,
    contextString: contextParts.join('\n\n'),
    isGoalsQuery,
    isRecentQuery,
    isProgressQuery,
    isHabitQuery,
    activeGoals,
    completedGoals,
    recentJournals: journals.slice(0, 3),
    relevantJournals,
    achievements,
    habits,
    memories
  };
}

function synthesizeRAGResponse(query, ragResult, store, activeName) {
  const nameSuffix = activeName ? ` ${activeName}` : '';

  // 1. Goals Query (e.g. "whats my goals ?")
  if (ragResult.isGoalsQuery) {
    if (ragResult.activeGoals.length === 0 && ragResult.completedGoals.length === 0) {
      return `I couldn't find any goals recorded in your goal tracker yet${nameSuffix}. You can set a new goal anytime by telling me what you're planning to learn or achieve!`;
    }

    let reply = `Based on your goal tracker${nameSuffix}:\n\n`;

    if (ragResult.activeGoals.length > 0) {
      reply += `🎯 **Active Goals**:\n`;
      ragResult.activeGoals.forEach(g => {
        reply += `• **${g.title}** (${g.progress}% progress${g.category ? `, ${g.category}` : ''})\n`;
      });
    } else {
      reply += `You currently don't have any active in-progress goals.\n`;
    }

    if (ragResult.completedGoals.length > 0) {
      reply += `\n🎉 **Completed Goals**:\n`;
      ragResult.completedGoals.slice(0, 5).forEach(g => {
        reply += `• **${g.title}**\n`;
      });
    }

    return reply.trim();
  }

  // 2. Recent Entries Query (e.g. "what did I write recently?")
  if (ragResult.isRecentQuery) {
    if (ragResult.recentJournals.length === 0) {
      return `I couldn't find any recent journal entries in your account yet${nameSuffix}. Try writing your first reflection in the Write Journal section!`;
    }

    let reply = `Here is a summary of what you wrote in your recent journal entries${nameSuffix}:\n\n`;
    ragResult.recentJournals.forEach(j => {
      const d = new Date(j.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      reply += `• **${d}** (${j.mood || 'Reflective'} ${j.moodEmoji || '💭'}):\n  "${j.content}"\n\n`;
    });

    return reply.trim() + `\n\nWould you like to reflect further on any of these topics?`;
  }

  // 3. Progress Query (e.g. "how am I progressing?")
  if (ragResult.isProgressQuery) {
    const totalJournals = (store.journals || []).length;
    const completedCount = ragResult.completedGoals.length;
    const activeCount = ragResult.activeGoals.length;
    const achCount = (store.achievements || []).length;

    if (totalJournals === 0 && completedCount === 0 && achCount === 0) {
      return `I couldn't find enough journal entries or goals to summarize your progress yet${nameSuffix}. Start journaling or setting goals to track your growth over time!`;
    }

    let reply = `Here's a breakdown of your overall progress${nameSuffix}:\n\n`;
    reply += `• 📝 **Journal Entries**: ${totalJournals} reflections recorded\n`;
    reply += `• 🏆 **Goals Completed**: ${completedCount} goals achieved\n`;
    if (activeCount > 0) {
      reply += `• 🎯 **Active Goals**: ${activeCount} goal${activeCount > 1 ? 's' : ''} currently in progress\n`;
    }
    if (achCount > 0) {
      reply += `• ⭐ **Milestones**: ${achCount} achievements logged\n`;
    }

    if (ragResult.completedGoals.length > 0) {
      reply += `\nRecent completed goals include: **${ragResult.completedGoals.slice(0, 3).map(g => g.title).join('**, **')}**! 🎉`;
    }

    return reply;
  }

  // 4. Habit Query
  if (ragResult.isHabitQuery) {
    if (ragResult.habits.length === 0) {
      return `You don't have any habits logged yet${nameSuffix}. Let me know if there's a daily habit you want to start building!`;
    }
    let reply = `Here are your logged daily habits${nameSuffix}:\n\n`;
    ragResult.habits.forEach(h => {
      reply += `• **${h.title}**\n`;
    });
    return reply.trim();
  }

  // 5. Keyword Topic Match
  if (ragResult.found && ragResult.relevantJournals.length > 0) {
    let reply = `Based on your journal entries${nameSuffix}:\n\n`;
    ragResult.relevantJournals.slice(0, 3).forEach(j => {
      const d = new Date(j.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      reply += `• **${d}**: "${j.content}"\n`;
    });
    return reply.trim();
  }

  // 6. RAG Fallback (Requirement 10)
  return `I couldn't find enough information in your journal to answer that accurately${nameSuffix}. Would you like to write a journal entry or share more details about it?`;
}

// Main AI Conversation & RAG Dispatcher
async function chatWithMemories(query, store, botName = 'Karr', history = []) {
  // 1. Check intent action handlers first (goal mutation, nickname update, identity, greetings)
  const intentResult = processKarrIntent(query, store, botName);

  if (intentResult) {
    return intentResult;
  }

  // 2. Perform Active RAG Context Retrieval from user store
  const ragResult = retrieveRAGContext(query, store);

  // 3. If LLM API Key is configured, construct prompt and execute LLM completion
  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (openaiKey || geminiKey) {
    const activeNick = store.userNickname ? `User Nickname: "${store.userNickname}"` : '';
    const historyText = Array.isArray(history) && history.length > 0
      ? history.slice(-6).map(h => `${h.role === 'user' ? 'User' : botName}: ${h.content}`).join('\n')
      : '';

    const systemPrompt = `You are "${botName}", the user's personal memory companion, thoughtful coach, journal buddy, and goal manager.

PERSONALITY & INSTRUCTIONS:
- Talk like a warm, supportive close friend.
- Answer the CURRENT USER MESSAGE directly based on the RETRIEVED MEMORY/JOURNAL CONTEXT provided below.
- Mirror the user's nickname if provided (${activeNick || 'none'}).
- Do NOT ignore the user's question.
- Do NOT replace the user's question with a generic greeting (such as "What's on your mind?").
- If NO relevant information is found in the context for the user's question, do NOT fake information. Politely state: "I couldn't find enough information in your journal to answer that accurately."

${historyText ? `CONVERSATION HISTORY:\n${historyText}\n` : ''}

RETRIEVED MEMORY/JOURNAL CONTEXT:
${ragResult.contextString || 'No relevant journal or memory entries found.'}

CURRENT USER MESSAGE:
"${query}"

Answer the CURRENT USER MESSAGE directly:`;

    const llmAnswer = await callLLMApi(systemPrompt);
    if (llmAnswer && llmAnswer.trim()) {
      return {
        answer: llmAnswer.trim(),
        intent: 'rag_chat',
        action: { action: 'none' }
      };
    }
  }

  // 4. Offline Active RAG Response Synthesizer (High accuracy fallback when LLM key is absent/unreachable)
  const synthesizedAnswer = synthesizeRAGResponse(query, ragResult, store, store.userNickname);

  return {
    answer: synthesizedAnswer,
    intent: 'rag_chat',
    action: { action: 'none' }
  };
}

module.exports = {
  analyzeJournal,
  chatWithMemories,
  callLLMApi
};


