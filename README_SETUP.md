# AI Fake News Detector - Setup Instructions

This project includes a **Next.js** frontend, an **Express** backend built with TypeScript, and **Prisma** for database logging.

## Prerequisites
- Node.js (recommended v20+)
- npm or yarn
- A Neon PostgreSQL connection string for database logging
- Optional: Git for version tracking

## Backend Setup

1. `cd backend`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy or create `.env` and set your database connection:
   ```bash
   cp .env.example .env
   ```
4. Update `.env` with your **DATABASE_URL** (Neon/Postgres string).
5. Generate Prisma client:
   ```bash
   npx prisma generate
   ```
6. Push the schema to the database:
   ```bash
   npx prisma db push
   ```
7. Run the backend:
   ```bash
   npm run dev
   ```

## Frontend Setup

1. `cd frontend`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create or update `.env.local` if you need a custom backend URL.
4. Start the frontend:
   ```bash
   npm run dev
   ```
5. Visit the app in your browser at `http://localhost:3000`

## Development Workflow

- Use `npm run dev` in `backend/` and `frontend/` simultaneously.
- Run `npm run build` in each folder before deployment.
- Keep `.env` out of source control and document any environment changes in `README.md`.

## How to use this file to increase commits

- Add setup improvements or environment troubleshooting steps.
- Document new backend or frontend scripts as you add them.
- Record configuration examples and edge cases.
- Each incremental improvement is a great commit.

## Project Features
- **AI Verdict Dashboard**: Real-time news verification insights.
- **Sentiment Analysis**: Detects manipulative language and sensationalism.
- **Source Credibility**: Scores sources using reputation patterns.
- **History Tracking**: Stores analysis results in the database.
- **Documentation-first workflow**: Keep docs updated for every feature.
