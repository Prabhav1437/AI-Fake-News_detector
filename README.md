# VeriNews AI — Misinformation Detection Engine

VeriNews AI is a misinformation detection platform designed to verify news articles using LLMs, retrieval-augmented evidence, and linguistic analysis.

## 🚀 What this project does

- Detects fake or manipulated news using model-driven analysis.
- Cross-checks claims against a labeled dataset and live evidence sources.
- Scores source credibility and highlights suspicious language patterns.
- Provides both a backend AI service and a responsive Next.js frontend.

## 📌 Quick Start

1. Install dependencies for both services:
   - `cd backend && npm install`
   - `cd frontend && npm install`
2. Configure environment variables in `backend/.env` and `frontend/.env.local`.
3. Start the backend:
   - `cd backend && npm run dev`
4. Start the frontend:
   - `cd frontend && npm run dev`

## 📂 Project Structure

- `backend/` — Express + TypeScript server, AI agent code, and database logging.
- `frontend/` — Next.js application, UI components, and analytics dashboard.
- `doc/` — Project documentation, architecture diagrams, and API reference.

## 🛠 Tech Stack

### Backend
- Express.js, TypeScript
- LangChain.js, Groq, Hugging Face inference
- Prisma ORM with Neon/Postgres support

### Frontend
- Next.js 15, React 19
- Tailwind CSS v4
- Framer Motion, Chart.js

## 📄 Documentation

For system details and architecture, see:
- `doc/README.md`
- `doc/System_Architecture.md`
- `doc/Pipeline_Diagram.md`
- `doc/ER_Diagram.md`
- `doc/API_Reference.md`

## 🤝 Contribution and commit guidance

This repository includes a `CONTRIBUTING.md` guide for contributions, commit formatting, and small change ideas. If you want to increase commit count, focus on:
- Improving documentation and README clarity.
- Adding API references and endpoint examples.
- Refining setup instructions and environment notes.
- Incrementally updating the changelog.

---
© 2026 VeriNews AI · Updated documentation and contribution workflow.
