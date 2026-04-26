# Rehabilitatemogotchi 🌱

A Tamagotchi-style companion for rehabilitation and recovery. Your virtual pet thrives when you do — daily quests around meetings, journaling, mindfulness, exercise, and connection keep both of you healthy.

Information about hackathon challenge [here]([url](https://docs.google.com/presentation/d/1fCWPJ_CDTrLP011aLo8x_g7zIeGODHv3KxSqAj2VLkM/edit?usp=sharing  )).
Presentation slideshow and explanation [here]([url](https://docs.google.com/presentation/d/1u62bREVNCxRR4dunQE8hX-HnvAcSqKbc/edit?usp=sharing&ouid=118235254943701465427&rtpof=true&sd=true)).

> **A note on tone**: Recovery is hard and rarely linear. This app is built to be supportive, not punitive. There are no "game overs" — only gentle nudges to come back. If you're in crisis, please reach out: **988** (Suicide & Crisis Lifeline) or **SAMHSA: 1-800-662-4357**.

---

## Tech Stack

- **Backend**: Node.js, Express, PostgreSQL (`pg` driver), JWT auth, bcrypt
- **Frontend**: React (Vite), Tailwind CSS
- **Database**: PostgreSQL 14+

## Project Structure

```
rehabilitatetomogotchi2/
├── backend/          # Express API + database layer
├── frontend/         # React app (Vite)
├── docker-compose.yml  # Optional: spin up Postgres locally
└── .env.example      # Copy to .env and fill in
```

## Quick Start

### 1. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Set up PostgreSQL

**Option A — Docker (easiest):**
```bash
docker compose up -d
```

**Option B — Local Postgres:**
Make sure Postgres is running, then create the database:
```bash
createdb rehabilitatetomogotchi
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env with your DB credentials and a JWT secret
```

### 4. Run migrations + seeds

```bash
cd backend
npm run db:setup
```

This creates tables and seeds the default quest catalog.

### 5. Start dev servers

In two terminals:
```bash
# Terminal 1 — backend on :4000
cd backend && npm run dev

# Terminal 2 — frontend on :5173
cd frontend && npm run dev
```

Open http://localhost:5173 and create an account.

---

## How the game works

- **Pet stats** (Health, Happiness, Energy) decay slowly over time. Completing daily quests restores them.
- **Sobriety streak** tracks consecutive sober days. You self-report.
- **Hard day button**: if you relapse or have a tough day, the streak resets gently with no penalty to the pet — recovery is non-linear.
- **Daily quests** refresh at midnight local time. Each completion gives a stat boost.
- **Journal** is private to you and helps reflect on triggers and wins.

## Disclaimer

This is a supportive tool, **not** a medical device or substitute for professional treatment. Please work with a counselor, sponsor, or doctor.
