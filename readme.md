# 🎓 AI Student Assessment Tool

> An intelligent web application for teaching assistants to automatically assess student GitHub repositories — with AI-generated code detection and plagiarism checking.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat&logo=postgresql&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_AI-Free-4285F4?style=flat&logo=google&logoColor=white)
![ZeroGPT](https://img.shields.io/badge/ZeroGPT-Detection-FF4B4B?style=flat)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)

---

## 📌 Overview

Teaching assistants spend hours manually reviewing student code submissions. This tool automates the entire assessment pipeline in one click:

1. **TA defines** an assignment with a description and max score
2. **Student submits** a GitHub repository URL with their student ID
3. **The system runs 3 checks in parallel:**
   - 📝 Code quality assessment via **Gemini AI**
   - 🤖 AI-generated code detection via **ZeroGPT API**
   - 👥 Plagiarism detection via **TF-IDF cosine similarity** against all previous submissions
4. **A full report is returned** — score, feedback, AI risk %, plagiarism match, and a risk flag

---

## ✨ What Makes This Different from Just Using ChatGPT

| Feature | ChatGPT | This Tool |
|---|---|---|
| Assess code quality | ✅ | ✅ |
| Custom assignment rubric | ❌ | ✅ |
| Detect AI-generated code | ❌ | ✅ |
| Compare students to each other | ❌ | ✅ |
| Save history per assignment | ❌ | ✅ |
| Class-wide plagiarism report | ❌ | ✅ |
| Risk flagging (Clean / Suspicious / High Risk) | ❌ | ✅ |

---

## 🚦 Risk Flag System

| Flag | Condition | Action |
|---|---|---|
| ✅ Clean | AI < 20% and Plagiarism < 30% | Normal grading |
| ⚠️ Suspicious | AI 20–50% or Plagiarism 30–60% | Manual review recommended |
| 🚨 High Risk | AI > 50% or Plagiarism > 60% | Flag for academic review |

> ⚠️ **Disclaimer:** AI detection results are indicative only and should always be reviewed by the instructor before taking any academic action.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS + React Router v6 |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Code Assessment | Google Gemini 1.5 Flash (free tier) |
| AI Detection | ZeroGPT API (free tier) |
| Plagiarism | TF-IDF + Cosine Similarity (custom built) |
| Repo Fetching | GitHub REST API |
| Deployment | Vercel (frontend) + Railway (backend) + Supabase (DB) |

---

## 📁 Project Structure

```
ai-assessment-tool/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AssignmentsPage.jsx
│   │   │   ├── AssessPage.jsx
│   │   │   ├── ResultPage.jsx
│   │   │   ├── HistoryPage.jsx
│   │   │   └── PlagiarismMatrixPage.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ScoreBadge.jsx
│   │   │   ├── RiskFlag.jsx
│   │   │   ├── FeedbackCard.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   └── App.jsx
│   └── package.json
│
├── backend/
│   ├── routes/
│   │   ├── assignments.js
│   │   └── assessments.js
│   ├── services/
│   │   ├── githubService.js
│   │   ├── geminiService.js
│   │   ├── zeroGptService.js
│   │   └── plagiarismService.js
│   ├── db/
│   │   ├── index.js
│   │   └── schema.sql
│   ├── middleware/
│   │   └── errorHandler.js
│   └── server.js
│
├── .env.example
├── .gitignore
```

---

## 🗄️ Database Schema

### `assignments`
| Column | Type | Description |
|---|---|---|
└── README.md
| id | SERIAL PK | Auto-incremented ID |
| name | VARCHAR(255) | Assignment name |
| description | TEXT | Full assignment brief |
| max_score | INTEGER | Maximum possible score |
| created_at | TIMESTAMP | Creation date |

### `assessments`
| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | Auto-incremented ID |
| assignment_id | INTEGER FK | References assignments(id) |
| student_id | VARCHAR(50) | Student university ID |
| repo_url | TEXT | GitHub repository URL |
| score | INTEGER | AI-assigned score |
| feedback | JSONB | Strengths, improvements, criteria |
| ai_detection_score | FLOAT | ZeroGPT result (0.0 – 1.0) |
| plagiarism_score | FLOAT | Highest similarity vs other students |
| plagiarism_match_id | VARCHAR(50) | Most similar student ID |
| risk_flag | VARCHAR(20) | clean / suspicious / high_risk |
| repo_text_snapshot | TEXT | Concatenated code — used for comparison |
| assessed_at | TIMESTAMP | Assessment timestamp |

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL v15+
- Git

### 1. Clone the repository

```bash
git clone https://github.com/aya-alharazin/ai-assessment-tool.git
cd ai-assessment-tool
```

### 2. Setup the backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:

```env
PORT=3001
DATABASE_URL=postgresql://localhost:5432/assessment_db
GEMINI_API_KEY=your_gemini_api_key_here
ZEROGPT_API_KEY=your_zerogpt_api_key_here
GITHUB_TOKEN=your_github_token_here
```

Run the database schema:

```bash
psql -U postgres -d assessment_db -f db/schema.sql
```

Start the backend:

```bash
npm run dev
```

### 3. Setup the frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 🌐 API Reference

### Assignments

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/assignments` | List all assignments |
| POST | `/api/assignments` | Create new assignment |
| GET | `/api/assignments/:id` | Get single assignment |
| DELETE | `/api/assignments/:id` | Delete assignment |

### Assessments

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/assessments` | Run full assessment pipeline |
| GET | `/api/assessments` | List all assessments |
| GET | `/api/assessments/:id` | Get single result |
| GET | `/api/assessments/plagiarism/:assignment_id` | Get plagiarism matrix |
| DELETE | `/api/assessments/:id` | Delete assessment |

---

## 🔑 Getting Free API Keys

| Service | Link | Free Tier |
|---|---|---|
| Google Gemini | [aistudio.google.com](https://aistudio.google.com) | 1M tokens/day |
| ZeroGPT | [zerogpt.com/api](https://zerogpt.com/api) | Free tier available |
| GitHub Token | [github.com/settings/tokens](https://github.com/settings/tokens) | Free — raises rate limit to 5000 req/hr |

---

## ☁️ Deployment (All Free)

| Service | Platform | Free Tier |
|---|---|---|
| Frontend | [Vercel](https://vercel.com) | ✅ Free |
| Backend | [Railway](https://railway.app) | ✅ Free |
| Database | [Supabase](https://supabase.com) | ✅ Free PostgreSQL |

---

## 📸 Screenshots

> _Coming soon — screenshots will be added after initial deployment_

---

## 🤝 Contributing

Contributions, issues and feature requests are welcome. Feel free to open an issue or submit a pull request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👩‍💻 Author

**Aya Alharazin**
- GitHub: [@aya-alharazin](https://github.com/aya-alharazin)
- LinkedIn: [in/aya-alharazin](https://linkedin.com/in/aya-alharazin)

---

<p align="center">Built with ❤️ for educators in Gaza, Palestine 🇵🇸</p>