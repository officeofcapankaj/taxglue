# TaxGlue Local Development Guide

This guide covers setting up TaxGlue for local development.

## Prerequisites

### Required Software

| Software | Version | Install |
|----------|---------|---------|
| Node.js | v18+ | [nodejs.org](https://nodejs.org) |
| Python | 3.9+ | [python.org](https://python.org) |
| Supabase CLI | Latest | [github.com/supabase/cli](https://github.com/supabase/cli) |

### Installation Commands

```bash
# macOS
brew install node python supabase

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs python3.9+
npm install -g supabase

# Windows (with Chocolatey)
choco install nodejs python
npm install -g supabase
```

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/taxglue.git
cd taxglue
```

### 2. Run Setup Script

```bash
# Make executable
chmod +x scripts/setup-local.sh

# Run setup
./scripts/setup-local.sh
```

### 3. Configure Environment

Edit `.env.local` and add your Supabase credentials:

```bash
# Get these from https://app.supabase.com/project/YOUR_PROJECT/settings/api
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### 4. Start Local Supabase

```bash
# Start local Supabase (PostgreSQL + API)
supabase start

# This starts:
# - PostgreSQL on port 54322
# - API Gateway on port 54321
# - Studio on http://localhost:54323
```

### 5. Apply Database Schema

```bash
# Push migrations to local Supabase
supabase db push

# Or apply SQL files directly
psql -h localhost -p 54322 -U postgres -d postgres -f supabase/migrations/001_initial_schema.sql
```

### 6. Run the Server

```bash
# Option 1: Run Flask directly
python3 server.py

# Option 2: Run with Vercel CLI (simulates production)
npx vercel dev

# Access at http://localhost:3000
```

## Development Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  LOCAL DEVELOPMENT WORKFLOW                                 │
├─────────────────────────────────────────────────────────────┤
│  1. Make changes in local environment                      │
│  2. Test thoroughly locally                                │
│  3. Commit: git add . && git commit -m "fix: ..."        │
│  4. Push: git push origin main                           │
│  5. Vercel auto-deploys to production                     │
│  6. Test at www.taxglue.in                               │
└─────────────────────────────────────────────────────────────┘
```

## Troubleshooting

### Server Won't Start

- Check Python version: `python3 --version` (needs 3.9+)
- Install dependencies: `pip3 install -r requirements.txt`
- Check port 3000 is not in use: `lsof -i :3000`

### Database Connection Fails

- Ensure Supabase is running: `supabase status`
- Check credentials in `.env.local`
- Verify PostgreSQL port: `psql -h localhost -p 54322 -U postgres`

### Frontend Won't Load

- Check browser console for errors
- Verify Supabase client is initialized
- Try incognito mode (cache issues)

## Common Commands

```bash
# Supabase
supabase start          # Start local Supabase
supabase stop           # Stop local Supabase
supabase status        # Check status
supabase db push       # Push schema changes

# Git
git status             # Check changes
git add .              # Stage all changes
git commit -m "msg"   # Commit changes
git push origin main   # Push to GitHub

# Development
python3 server.py     # Run server
npm run dev          # Run with hot reload (if available)
```

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anon key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server only) | No |
| `FLASK_ENV` | Flask environment (development/production) | No |
| `FLASK_SECRET_KEY` | Secret key for sessions | No |

## Supabase Studio

Access local Supabase Studio at:
- **URL**: http://localhost:54323
- **Email**: admin@supabase.io
- **Password**: admin (or check `supabase status`)

## Production Deployment

Code is automatically deployed to Vercel when pushed to GitHub:

```bash
git push origin main
```

Monitor deployments at: https://vercel.com/dashboard

### Production Environment Variables

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```