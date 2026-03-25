# Talking Bat · Cricket Analytics Dashboard

A modern, beautiful cricket analytics dashboard built with **Next.js 15**, **TypeScript**, and **Tailwind CSS**.

## Features

- **Home page** — Tournament overview, top run scorers & wicket takers leaderboards, all-players grid
- **Player Profile** — Batting & bowling stats, wagon wheel, phase analysis (PP/Middle/Death), shot breakdown, length/line heatmaps, dismissal chart, innings run chart, vs Pace/Spin breakdown, vs RHB/LHB breakdown
- **Team pages** — Full squad, batting & bowling tables

## Tech Stack

- Next.js 15 (App Router, Static Export)
- TypeScript
- Tailwind CSS
- Canvas API (wagon wheel / spider web)
- No external chart library dependencies

## Data

Ball-by-ball data from National T20 Cup 2025 + 157 squad players across 8 T20 franchises.

## Setup

```bash
# Install dependencies
npm install

# Process raw CSV data (requires Python 3)
cd ..
python process_data.py
cd cricket-dashboard

# Run dev server
npm run dev

# Production build
npm run build
```

## Deploy to Vercel

1. Push this folder (`cricket-dashboard/`) to a GitHub repo
2. Import the repo in Vercel
3. Set **Output Directory** to `out`
4. Deploy

> **Note:** The `public/data/` folder contains pre-processed JSON files (~160 files, ~5MB). These are committed and served as static assets — no server-side database needed.
