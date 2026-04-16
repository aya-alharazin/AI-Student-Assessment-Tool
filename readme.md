
# 📝 Assess Students – Java GitHub Repo Evaluator

A full-stack tool that automatically evaluates Java assignments from GitHub repositories using Google Gemini AI. Paste a repo URL and an assignment description, and get back a structured JSON report with a score, strengths, and weaknesses.

---

## ✨ Features

- 🔗 Accepts any public GitHub repository URL
- 📄 Automatically discovers and reads all `.java` files from the repo
- 🤖 Sends code to **Google Gemini (`gemini-2.5-flash`)** for AI-powered evaluation
- 📊 Returns a structured JSON report:
  - `score` – numeric score (0–5)
  - `strengths` – array of positive observations
  - `Weakness` – array of improvement areas
- 🌐 Simple HTML frontend for easy interaction

---

## 🗂️ Project Structure

```
project-root/
├── index.html      # Frontend UI (form + results display)
├── server.js       # Backend (Express + GitHub API + Gemini AI)
└── package.json    # Dependencies
```

---

## ⚙️ Requirements

- **Node.js** v18 or v20+
- **npm**
- A **Google Generative AI API key** → `GEMINI_API_KEY`
- *(Recommended)* A **GitHub Personal Access Token** → `GITHUB_TOKEN` (avoids rate limits)

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Install dependencies

```bash
npm install
```

Your `package.json` should include:

```json
"dependencies": {
  "express": "^4.x",
  "cors": "^2.x",
  "axios": "^1.x",
  "dotenv": "^16.x",
  "@google/generative-ai": "^0.x"
}
```

### 3. Create a `.env` file

In the project root, create a file named `.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GITHUB_TOKEN=your_github_token_here   # Optional but recommended
PORT=3000                              # Optional, defaults to 3000
```


## ▶️ Running the App

### Start the backend server

```bash
node server.js
```

You should see:

```
Server running on http://localhost:3000
```

### Open the frontend

Open `index.html` directly in your browser (double-click or use a local static server).

---

## 🖥️ Usage

1. Fill in the form:
   - **GitHub Repository URL** – e.g., `https://github.com/owner/repo`
   - **Assignment Description** – describe what the student was supposed to do
2. Click **Analyze**
3. View the JSON result in the output area

### Example Input

| Field | Example Value |
|-------|--------------|
| GitHub Repo URL | `https://github.com/aya-alharazin/IUG-Advanced-Java-OOP-Review` |
| Assignment Description | `Review Java OOP concepts and quality for this assignment` |

### Example Output

```json
{
  "result": {
    "score": 4.5,
    "strengths": [
      "Uses clear OOP structure",
      "Good class separation and encapsulation",
      "Meaningful variable names"
    ],
    "Weakness": [
      "Needs better error handling",
      "Missing JavaDoc comments",
      "Some methods are too long"
    ]
  }
}
```

---

## 🔌 API Reference

### `POST /api/evaluate`

**Request Body:**

```json
{
  "repoUrl": "https://github.com/owner/repo",
  "assignmentDescription": "Implement a linked list in Java"
}
```

**Response:**

```json
{
  "result": {
    "score": 3.5,
    "strengths": ["..."],
    "Weakness": ["..."]
  }
}
```

---

## 🏗️ How It Works

### Backend (`server.js`)

1. **Receives** a `POST` request with `repoUrl` and `assignmentDescription`
2. **Extracts** the `owner/repo` from the GitHub URL
3. **`getJavaFiles(repoFullName, githubToken)`**
   - Hits `GET /repos/{owner}/{repo}` to find the default branch
   - Calls `/git/trees/{branch}?recursive=1` to list all files
   - Filters for `.java` blobs and returns their URLs
4. **`readJavaFiles(urls, githubToken)`**
   - Downloads each file via GitHub Blob API
   - Decodes Base64 content
   - Concatenates all code with `// FILE: ...` headers
5. **Builds a prompt** for Gemini including the assignment description and code
6. **Calls `gemini-2.5-flash`** via `@google/generative-ai`
7. **Parses** the response as JSON and returns it to the client

### Frontend (`index.html`)

- A minimal HTML form with:
  - `#repoUrl` — URL input
  - `#assignmentDescription` — textarea
  - `#submitBtn` — trigger button
  - `#output` — `<pre>` block for results
- On click: reads inputs → sends `fetch` POST to `/api/evaluate` → displays JSON or error

---



## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `express` | HTTP server and routing |
| `cors` | Cross-origin request support |
| `axios` | HTTP requests to GitHub API |
| `dotenv` | Load environment variables from `.env` |
| `@google/generative-ai` | Google Gemini AI SDK |

---
