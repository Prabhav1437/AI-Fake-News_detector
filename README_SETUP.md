# AI Fake News Detector - Setup Instructions

This project is built with a **Next.js** frontend (Tailwind v4), an **Express** backend (TypeScript), and **Prisma** for database logging.

## Prerequisites
- Node.js installed
- A Neon PostgreSQL connection string (provided by user)

## Backend Setup
1. `cd backend`
2. Update `.env` with your actual **DATABASE_URL** (Neon string).
3. Generate Prisma client:
   ```bash
   npx prisma generate
   ```
4. Push the schema to Neon:
   ```bash
   npx prisma db push
   ```
5. Start the server:
   ```bash
   npm run dev
   ```

## Frontend Setup
1. `cd frontend`
2. Update `.env.local` if you change the backend port.
3. Start the development server:
   ```bash
   npm run dev
   ```

## Project Features
- **AI Verdict Dashboard**: Real-time evaluation of news articles.
- **Sentiment Analysis**: Detecting manipulative language and sensationalism.
- **Source Credibility**: Cross-referencing against trusted/flagged patterns.
- **History Tracking**: Automatically saves every analysis to your Neon database.
- **Canva Report Mockup**: Dedicated UI for exporting results.
