# VeriNews AI — Misinformation Detection Engine

VeriNews AI is a state-of-the-art misinformation detection system that leverages Large Language Models (LLMs), Retrieval-Augmented Generation (RAG), and linguistic fingerprinting to verify the integrity of news articles in real-time.

## 🚀 Key Features

- **Deep Neural Scan**: Analyzes news for factual consistency, emotional manipulation, and logical fallacies.
- **RAG-Powered Evidence**: Cross-references input against a historical database of 26,000+ labeled articles.
- **Source Reputation Map**: Instant credibility scoring based on a curated map of global news domains.
- **Interactive AI Chat**: Conversational follow-ups specialized in explaining the verification verdict.
- **Glassmorphic UI**: High-density, interactive dashboard built for high-performance intelligence analysis.

## 🛠 Tech Stack

### Backend
- **Framework**: Express.js with TypeScript
- **AI Orchestration**: LangChain.js
- **LLM**: Llama 3 (via Groq) for ultra-fast reasoning
- **Embeddings**: HuggingFace (sentence-transformers)
- **Vector Store**: Memory-based Vector Store for RAG
- **Database**: Prisma ORM with SQLite (Analysis logging)

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Visualization**: Chart.js (Trust scoring)
- **Background**: Custom Canvas-based Particle Newspaper system

## 📂 Project Structure

- `backend/`: Node.js server, AI Agent logic, and RAG implementation.
- `frontend/`: Next.js application, interactive dashboard, and landing page.

## 🧪 Evaluation

The system includes a dedicated evaluation endpoint (`/api/evaluate`) that tests the AI's accuracy against the core dataset.
- **Dataset**: 26,000+ articles (Historical FAKE/REAL signatures).
- **Target Accuracy**: >90% on labeled misinformation vectors.

---
© 2026 Team VeriNews AI · Built with purpose, powered by AI.
