# Deployment Guide

## Option 1: Railway (Recommended)

Railway makes it easy to deploy the full stack with a few clicks.

### Step 1 — Create a Railway Account
Go to [railway.app](https://railway.app) and sign up with your GitHub account.

### Step 2 — Create a New Project
1. Click **"New Project"** from your Railway dashboard
2. Select **"Deploy from GitHub Repo"**
3. Choose `shriyashpatil/ai-interview-agent`

### Step 3 — Add a PostgreSQL Database
1. Inside your project, click **"+ New"** → **"Database"** → **"PostgreSQL"**
2. Railway auto-provisions the database and provides connection variables

### Step 4 — Deploy the Backend
1. Click **"+ New"** → **"GitHub Repo"** → select your repo
2. Set the **Root Directory** to `backend`
3. Go to the service's **Variables** tab and add:
   ```
   SPRING_PROFILES_ACTIVE=prod
   DB_HOST=${{Postgres.PGHOST}}
   DB_PORT=${{Postgres.PGPORT}}
   DB_NAME=${{Postgres.PGDATABASE}}
   DB_USERNAME=${{Postgres.PGUSER}}
   DB_PASSWORD=${{Postgres.PGPASSWORD}}
   CLAUDE_API_KEY=your-anthropic-api-key
   JWT_SECRET=generate-a-strong-random-string-here
   SPRING_JPA_HIBERNATE_DDL_AUTO=update
   ```
4. Railway will auto-detect the Dockerfile and build

### Step 5 — Deploy the Frontend
1. Click **"+ New"** → **"GitHub Repo"** → select your repo again
2. Set the **Root Directory** to `frontend`
3. Go to the service's **Variables** tab and add:
   ```
   PORT=80
   BACKEND_URL=http://your-backend-service.railway.internal:8080
   ```
   (Use the backend's **internal** Railway URL — find it in the backend service's Settings → Networking)
4. Under **Settings → Networking**, click **"Generate Domain"** to get a public URL

### Step 6 — Update CORS
Update the backend's `SecurityConfig.java` to include your Railway frontend URL in the allowed origins list.

---

## Option 2: Docker Compose (Local / VPS)

### Prerequisites
- Docker and Docker Compose installed
- A Claude API key

### Quick Start
```bash
# Clone the repo
git clone https://github.com/shriyashpatil/ai-interview-agent.git
cd ai-interview-agent

# Set your API key
export CLAUDE_API_KEY=your-anthropic-api-key

# Build and run everything
docker compose up --build -d
```

The app will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080
- **Database:** localhost:5432

### Stop
```bash
docker compose down
```

### Stop and remove data
```bash
docker compose down -v
```

---

## Option 3: Deploy to a VPS (DigitalOcean, Linode, etc.)

1. SSH into your server
2. Install Docker and Docker Compose
3. Clone the repo and run:
   ```bash
   export CLAUDE_API_KEY=your-key
   export JWT_SECRET=$(openssl rand -base64 32)
   docker compose up --build -d
   ```
4. Set up a reverse proxy (Nginx/Caddy) to point your domain to port 3000
5. Add SSL with Let's Encrypt

---

## Environment Variables Reference

| Variable | Where | Description |
|----------|-------|-------------|
| `CLAUDE_API_KEY` | Backend | Your Anthropic API key |
| `JWT_SECRET` | Backend | Random string for signing JWT tokens |
| `SPRING_PROFILES_ACTIVE` | Backend | Set to `prod` for production |
| `DB_HOST` | Backend | PostgreSQL host |
| `DB_PORT` | Backend | PostgreSQL port (default 5432) |
| `DB_NAME` | Backend | Database name |
| `DB_USERNAME` | Backend | Database user |
| `DB_PASSWORD` | Backend | Database password |
| `BACKEND_URL` | Frontend | Full URL to the backend (e.g. http://backend:8080) |
| `PORT` | Frontend | Port for Nginx (Railway sets this automatically) |
| `VITE_API_URL` | Frontend (build-time) | Optional: set if frontend calls API directly without Nginx proxy |
