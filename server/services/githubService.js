const https = require('https');

// Helper to make GET requests to GitHub API
function githubGetRequest(path, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'MyJournal-App',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `token ${token}`;
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(new Error('Invalid JSON response from GitHub API'));
          }
        } else {
          try {
            const errJson = JSON.parse(body);
            reject(new Error(errJson.message || `GitHub API error: ${res.statusCode}`));
          } catch (e) {
            reject(new Error(`GitHub API error: ${res.statusCode}`));
          }
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.end();
  });
}

// Fetch GitHub user profile details
async function fetchUserProfile(username, token) {
  try {
    const data = await githubGetRequest(`/users/${username}`, token);
    return {
      username: data.login,
      name: data.name || data.login,
      avatarUrl: data.avatar_url,
      bio: data.bio || "No biography provided.",
      publicRepos: data.public_repos,
      htmlUrl: data.html_url
    };
  } catch (error) {
    console.error(`Error fetching GitHub user ${username}:`, error.message);
    throw error;
  }
}

// Fetch user's recent repository commits/activity
async function fetchUserCommits(username, token) {
  try {
    // Fetch user events which contains commits, push events, etc.
    const events = await githubGetRequest(`/users/${username}/events`, token);
    const commits = [];

    // Filter and collect commits from PushEvents
    for (const event of events) {
      if (event.type === 'PushEvent' && event.payload && event.payload.commits) {
        const repoName = event.repo.name;
        for (const commit of event.payload.commits) {
          commits.push({
            id: commit.sha,
            repo: repoName,
            message: commit.message,
            date: event.created_at,
            author: commit.author.name || username,
            url: `https://github.com/${repoName}/commit/${commit.sha}`
          });
        }
      }
    }

    // Sort by date descending
    return commits.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 15);
  } catch (error) {
    console.error(`Error fetching commits for ${username}:`, error.message);
    throw error;
  }
}

// Simulated data fallback
function generateMockCommits(username = "demo-dev") {
  const repos = [`${username}/myjournal`, `${username}/gemini-rag-engine`, `${username}/fitness-tracker`];
  const messages = [
    "Refactored authentication hooks and session storage",
    "Implemented vector embedding caching using file backend",
    "Added dark mode and glassmorphism styling to dashboard components",
    "Fixed layout jump in mobile viewports and optimized image loaders",
    "Integrated Gemini-1.5-Flash RAG chat system for context memory queries",
    "Added unit tests for journal mood heuristic and AI fallback parser",
    "Wrote scripts for automatic weekly journal summaries and achievement badges",
    "Configured custom cron job schedule trigger to remind user to write logs",
    "Refactored database saveStore write buffers to prevent lock contention",
    "Added Lucide icons package dependencies to client build config"
  ];

  const now = new Date();
  const mockCommits = [];

  for (let i = 0; i < 8; i++) {
    const commitDate = new Date(now.getTime() - i * 3600000 * 4); // every 4 hours approx
    const sha = Math.random().toString(16).substring(2, 9) + Math.random().toString(16).substring(2, 9);
    const repo = repos[i % repos.length];
    mockCommits.push({
      id: sha,
      repo: repo,
      message: messages[i % messages.length],
      date: commitDate.toISOString(),
      author: username,
      url: `https://github.com/${repo}/commit/${sha}`
    });
  }

  return mockCommits;
}

module.exports = {
  fetchUserProfile,
  fetchUserCommits,
  generateMockCommits
};
