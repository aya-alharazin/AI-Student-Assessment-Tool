// server.js
const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(express.json()); // to parse JSON bodies

// helper: get Java files for any repo URL
async function getJavaFiles(repoFullName, githubToken) {
  const github = axios.create({
    baseURL: `https://api.github.com/repos/${repoFullName}`,
    headers: {
      ...(githubToken
        ? { Authorization: `Bearer ${githubToken}` }
        : {}),
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  const repoRes = await github.get("");
  const branch = repoRes.data.default_branch;

  const treeRes = await github.get(`/git/trees/${branch}?recursive=1`);
  const tree = treeRes.data.tree || [];

  const codeFiles = tree.filter(
    (item) => item.type === "blob" && item.path.endsWith(".java")
  );

  // return blob API URLs
  return codeFiles.map((file) => file.url);
}

async function readJavaFiles(urls, githubToken) {
  if (!Array.isArray(urls) || urls.length === 0) return "";

  const github = axios.create({
    headers: {
      ...(githubToken
        ? { Authorization: `Bearer ${githubToken}` }
        : {}),
      Accept: "application/vnd.github+json",
    },
  });

  let codeStr = "";
  for (const url of urls) {
    const res = await github.get(url);
    const contentBase64 = res.data.content;
    const code = Buffer.from(contentBase64, "base64").toString("utf-8");
    codeStr += `\n// FILE: ${res.data.path || "unknown"}\n` + code;
  }
  return codeStr;
}

// POST /api/evaluate
app.post("/api/evaluate", async (req, res) => {
  try {
    const { repoUrl, assignmentDescription } = req.body;

    if (!repoUrl || !assignmentDescription) {
      return res.status(400).json({ error: "repoUrl and assignmentDescription are required" });
    }

    // Extract "owner/repo" from e.g. https://github.com/aya-alharazin/IUG-Advanced-Java-Object-Oriented-Programming-Review
    const match = repoUrl.match(/github\.com\/([^/]+\/[^/]+)/i);
    if (!match) {
      return res.status(400).json({ error: "Invalid GitHub repo URL" });
    }
    const repoFullName = match[1]; // owner/repo

    const javaFiles = await getJavaFiles(repoFullName, process.env.GITHUB_TOKEN);
    if (!Array.isArray(javaFiles) || javaFiles.length === 0) {
      return res.status(404).json({ error: "No .java files found in repository" });
    }

    const code = await readJavaFiles(javaFiles, process.env.GITHUB_TOKEN);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const maxScore = 5;

    const prompt = `
You are an expert advanced Java instructor.

TASK:
Evaluate the following student code based on the assignment.

INPUT:
Assignment Description: ${assignmentDescription}

Max Score:
${maxScore}

Student Code:
${code}

OUTPUT:
Return ONLY valid JSON in this exact format:

{
  "score": number,
  "strengths": ["string", "string", "string"],
  "Weakness": ["string", "string", "string"]
}

RULES:
- Score must be between 0 and ${maxScore}
- Be concise and specific
- Do not include any text outside the JSON
`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();

    // Optional: strip code fences if they appear
    text = text.trim();
    if (text.startsWith("```")) {
      text = text.replace(/^```[a-zA-Z]*\s*/, "").replace(/```$/, "").trim();
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      return res.status(502).json({ error: "Model returned non-JSON", raw: text });
    }

    return res.json({ result: parsed });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});