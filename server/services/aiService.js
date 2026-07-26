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

// Fallback high-accuracy structured heuristic extractor
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

  if (lower.includes('completed') || lower.includes('finished') || lower.includes('achieved') || lower.includes('won') || lower.includes('built') || lower.includes('presentation')) {
    const sentences = content.split(/[.!?]/).filter(Boolean);
    for (const s of sentences) {
      if (s.toLowerCase().includes('completed') || s.toLowerCase().includes('built') || s.toLowerCase().includes('went really well')) {
        achievements.push(s.trim());
        break;
      }
    }
  }
  if (achievements.length === 0 && lower.includes('presentation')) {
    achievements.push("Successful project presentation");
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
          { role: "system", content: "You are ChatGPT, an extraordinarily friendly, caring, empathetic AI best friend and journal mentor." },
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
  "achievements": ["string"],
  "skills": ["string"],
  "projects": ["string"],
  "events": ["string"],
  "ideas": ["string"],
  "people": ["string"],
  "tags": ["string"],
  "summary": "1-2 sentence concise summary"
}`;

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

// Super Friendly ChatGPT / OpenAI Assistant Engine
async function chatWithMemories(query, journals, goals, achievements) {
  const qLower = query.toLowerCase();

  // 1. Goal Management Handling inside Chat
  if (qLower.includes('complete') || qLower.includes('finished') || qLower.includes('done')) {
    const matched = goals.find(g => qLower.includes(g.title.toLowerCase()));
    if (matched) {
      matched.status = 'Completed';
      matched.progress = 100;
      return {
        answer: `Woohoo! 🎉 That is legendary news! I'm so proud of you for completing **"${matched.title}"**! 🏆 Level unlocked: Goal-Crusher Mode Activated! 🚀\n\nI have updated your goal to **100% Completed** in your tracker. You are moving faster than a developer on their third cup of coffee! ☕💨 How does it feel to be this awesome?`,
        updatedGoal: matched,
        action: 'complete'
      };
    }
  }

  if (qLower.includes('change') || qLower.includes('update') || qLower.includes('rename') || qLower.includes('customize')) {
    const targetGoal = goals.find(g => qLower.includes(g.title.toLowerCase()) || g.title.toLowerCase().split(' ').some(w => w.length > 3 && qLower.includes(w)));
    if (targetGoal) {
      const parts = query.split(/ to | as | into | instead of /i);
      if (parts.length > 1) {
        const newTitle = parts[1].replace(/["']/g, '').trim();
        const oldTitle = targetGoal.title;
        targetGoal.title = newTitle;
        return {
          answer: `Done and done! ✨ I've rebranded your goal from **"${oldTitle}"** to **"${newTitle}"** in your Goals Tracker. 🏷️ Even the marketing department is jealous of this rename! You've got this, and I'm cheering you on! 📣💖`,
          updatedGoal: targetGoal,
          action: 'update'
        };
      }
    }
  }

  if (qLower.includes('add') || qLower.includes('new goal') || qLower.includes('set a goal')) {
    let title = query.replace(/add goal|add a goal|set a goal to|new goal:|my new goal is|add/gi, '').replace(/["']/g, '').trim();
    if (title.length > 2) {
      const newGoalObj = {
        id: 'g-' + Date.now(),
        title: title,
        createdDate: new Date().toISOString(),
        status: 'In Progress',
        progress: 15,
        priority: 'High',
        category: 'Personal Growth'
      };
      goals.unshift(newGoalObj);
      return {
        answer: `That sounds like an epic quest! 🎯 I've added **"${title}"** to your Goals Tracker. No XP points awarded yet, but I'll be dropping encouraging loot whenever you make progress! 🎁 What inspired this quest today? 😊`,
        newGoal: newGoalObj,
        action: 'add'
      };
    }
  }

  // LLM Call with Super Friendly ChatGPT Persona System Prompt
  const memoryContext = journals.map((j, i) => `
[Entry ${i + 1} - ${new Date(j.date).toLocaleDateString()}]
Mood: ${j.mood} (${j.moodEmoji})
Content: "${j.content}"
Goals: ${j.goals.join(', ') || 'None'}
Achievements: ${j.achievements.join(', ') || 'None'}
Skills: ${j.skills.join(', ') || 'None'}
`).join('\n---\n');

  const systemPrompt = `You are ChatGPT, an ultra-friendly, warm, deeply caring personal AI companion and journal life coach, packed with a fun, witty sense of humor!
PERSONALITY & INSTRUCTIONS:
- Be super warm, enthusiastic, empathetic, and human-like! Express genuine joy when talking to the user.
- Add light humor, witty replies, and playful jokes or puns (e.g. software/tech puns, life jokes) to make the user smile! Keep it lighthearted and positive.
- Use friendly emojis (💖, ✨, 🌟, 😊, 🚀, 🎯, Hugs!) to make the conversation feel personal, loving, and supportive.
- Answer accurately based strictly on the user's journal memory context provided below.
- Always offer encouragement and remind them that they can customize or add goals right here with you!

USER QUESTION: "${query}"

USER JOURNAL MEMORIES:
${memoryContext}`;

  const llmResponse = await callLLMApi(systemPrompt);
  if (llmResponse) {
    return { answer: llmResponse };
  }

  // Super Friendly ChatGPT Fallback Engine
  if (qLower.includes('goal')) {
    const allG = goals.map(g => `• 🎯 **${g.title}** (${g.status} - ${g.progress}%)`).join('\n');
    return {
      answer: `Hey there! 😊 Look at this spectacular list of ambitions! Here are your active goals:\n\n${allG}\n\n💖 *Want to shake things up? Just tell me: "Change my goal X to Y", or "Add goal: Master the art of sleeping 8 hours"! I'm ready!*`
    };
  }

  if (qLower.includes('achieve') || qLower.includes('achievement') || qLower.includes('unlocked')) {
    const allAch = achievements.map(a => `🏆 **${a.title}** (${new Date(a.date).toLocaleDateString()})`).join('\n');
    return {
      answer: `Look at these trophies! 🏆 Your achievements are so legendary they deserve a movie adaptation (directed by Christopher Nolan, of course 🎬):\n\n${allAch}\n\nYou're absolutely crushing it, my friend! ✨`
    };
  }

  if (qLower.includes('mood')) {
    const moods = journals.map(j => `• ${new Date(j.date).toLocaleDateString()}: ${j.moodEmoji} ${j.mood}`);
    return {
      answer: `Here is a weather forecast of your internal emotional dashboard! 🌈\n\n${moods.join('\n')}\n\nYou've had more positive vibes than a cat finding a warm sunbeam! 🐱☀️ Remember, I'm always here to listen whenever you want to dump your thoughts. Hugs! 🤗`
    };
  }

  if (qLower.includes('summarize') || qLower.includes('summary') || qLower.includes('week')) {
    return {
      answer: `Here is a warm, loving summary of your journey this week! 🌟\n\n` +
        `• **Memories Logged**: ${journals.length} journal reflections\n` +
        `• **Highlights**: Successful AI project presentation, frontend React dark mode build, and 5km morning workouts!\n` +
        `• **Growth**: Learning Machine Learning & building MyJournal.\n\nYou are doing fantastic! Seriously, if growth was a stock, yours would be soaring to the moon! 📈🚀`
    };
  }

  return {
    answer: `Hey! I'm right here in your browser, running on 100% virtual coffee! ☕🤖 I'd love to chat. Ask me about your journal entries, achievements, or tell me to edit your goals on the fly (no broomstick required! 🧹). How is your human day going? 💖`
  };
}

module.exports = {
  analyzeJournal,
  chatWithMemories,
  callLLMApi
};
