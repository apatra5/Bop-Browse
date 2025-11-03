# Bop-Browse Backend Deployment Guide

This guide walks you through deploying your FastAPI backend to production and connecting your React Native frontend.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Deployment Options](#deployment-options)
   - [Option 1: Railway (Recommended)](#option-1-railway-recommended)
   - [Option 2: Render](#option-2-render)
   - [Option 3: Docker + Any Cloud Provider](#option-3-docker--any-cloud-provider)
4. [Database Setup](#database-setup)
5. [Running Migrations](#running-migrations)
6. [Connecting Frontend](#connecting-frontend)
7. [Post-Deployment Tasks](#post-deployment-tasks)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Python 3.11+
- PostgreSQL 14+ with pgvector extension
- Git
- (Optional) Docker for containerized deployment

---

## Local Development Setup

### 1. Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Set Up Environment Variables

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/bopbrowse
```

### 3. Set Up PostgreSQL Database

```bash
# Install PostgreSQL if not already installed
# On macOS: brew install postgresql
# On Ubuntu: sudo apt-get install postgresql postgresql-contrib

# Create database
createdb bopbrowse

# Enable pgvector extension (required for item embeddings)
psql bopbrowse -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

### 4. Run Database Migrations

```bash
cd backend
alembic upgrade head
```

### 5. Start Development Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Your API will be available at `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

---

## Deployment Options

### Option 1: Railway (Recommended)

**Why Railway?**
- ✅ Free tier with PostgreSQL included
- ✅ Automatic deployments from GitHub
- ✅ Built-in PostgreSQL with pgvector support
- ✅ Zero configuration needed

#### Steps:

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Select your `Bop-Browse` repository

3. **Add PostgreSQL Database**
   - In your project, click "+ New"
   - Select "Database" → "PostgreSQL"
   - Railway automatically provisions a PostgreSQL instance

4. **Enable pgvector Extension**
   - Click on your PostgreSQL service
   - Go to "Connect" tab and copy the connection command
   - Run locally: `psql <connection_string> -c "CREATE EXTENSION IF NOT EXISTS vector;"`
   - Or use Railway's built-in Query tab

5. **Configure Backend Service**
   - Click on your backend service
   - Go to "Settings" → "Root Directory"
   - Set to: `backend`
   - Set "Start Command" to: `uvicorn main:app --host 0.0.0.0 --port $PORT`

6. **Set Environment Variables**
   - Click on your backend service
   - Go to "Variables" tab
   - Add variable: `DATABASE_URL`
   - Click "Add Reference" → Select your PostgreSQL service → Select `DATABASE_URL`
   - Railway automatically connects your backend to the database

7. **Run Migrations**
   - In Railway, go to your backend service
   - Click "Deploy" → "Custom Start Command" (one-time)
   - Run: `alembic upgrade head`
   - After migrations complete, remove custom command

8. **Generate Domain**
   - Go to "Settings" → "Networking"
   - Click "Generate Domain"
   - Your API will be available at: `https://your-app.up.railway.app`

---

### Option 2: Render

**Why Render?**
- ✅ Free tier available
- ✅ Easy setup with PostgreSQL
- ✅ Auto-deploy from GitHub

#### Steps:

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create PostgreSQL Database**
   - Dashboard → "New +" → "PostgreSQL"
   - Choose free tier
   - Name: `bopbrowse-db`
   - Save the "Internal Database URL"

3. **Enable pgvector Extension**
   - In database dashboard, go to "Connection" tab
   - Use provided connection string to connect via psql
   - Run: `CREATE EXTENSION IF NOT EXISTS vector;`

4. **Create Web Service**
   - Dashboard → "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `bopbrowse-backend`
     - **Root Directory**: `backend`
     - **Environment**: `Python 3`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

5. **Set Environment Variables**
   - In web service settings, go to "Environment"
   - Add: `DATABASE_URL` = (paste internal database URL from step 2)

6. **Run Migrations**
   - After first deploy, go to "Shell" tab
   - Run: `alembic upgrade head`

7. **Access Your API**
   - Your API will be at: `https://bopbrowse-backend.onrender.com`
   - API docs: `https://bopbrowse-backend.onrender.com/docs`

---

### Option 3: Docker + Any Cloud Provider

Use this option for AWS ECS, Google Cloud Run, DigitalOcean, etc.

#### Dockerfile

A `Dockerfile` has been created in the backend directory. Build and deploy:

```bash
cd backend
docker build -t bopbrowse-backend .
docker run -p 8000:8000 -e DATABASE_URL=<your-db-url> bopbrowse-backend
```

#### Deploy to Google Cloud Run

```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/bopbrowse-backend

# Deploy to Cloud Run
gcloud run deploy bopbrowse-backend \
  --image gcr.io/YOUR_PROJECT_ID/bopbrowse-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=<your-db-url>
```

#### Deploy to AWS ECS/Fargate

1. Push Docker image to ECR
2. Create RDS PostgreSQL instance (enable pgvector)
3. Create ECS task definition with environment variables
4. Create ECS service with load balancer

---

## Database Setup

### PostgreSQL with pgvector

Your backend uses pgvector for item embeddings (768-dimensional vectors for ML recommendations).

**Enable pgvector:**

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

**Verify Installation:**

```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```

### Connection String Format

```
postgresql://username:password@host:port/database_name
```

Example:
```
postgresql://postgres:mypassword@localhost:5432/bopbrowse
```

---

## Running Migrations

After deploying, you must run database migrations:

### Railway
- Go to backend service → Settings → Deploy
- One-time command: `alembic upgrade head`

### Render
- Go to Shell tab
- Run: `alembic upgrade head`

### Docker/SSH Access
```bash
alembic upgrade head
```

### Verify Migrations
```bash
alembic current
# Should show: "head"
```

---

## Connecting Frontend

Your React Native app needs to connect to the deployed backend.

### 1. Update API Base URL

#### Frontend Configuration File

Create or update `frontend/config/api.js`:

```javascript
const ENV = {
  dev: {
    apiUrl: 'http://localhost:8000',
  },
  staging: {
    apiUrl: 'https://your-app.up.railway.app',  // Your Railway URL
  },
  prod: {
    apiUrl: 'https://your-app.up.railway.app',  // Your production URL
  },
};

const getEnvVars = () => {
  if (__DEV__) {
    return ENV.dev;
  }
  return ENV.prod;
};

export default getEnvVars;
```

#### Update Your API Calls

```javascript
import getEnvVars from './config/api';

const { apiUrl } = getEnvVars();

// Example API call
const fetchItems = async () => {
  const response = await fetch(`${apiUrl}/items/feed`);
  const data = await response.json();
  return data;
};
```

### 2. Add CORS Support to Backend

Your backend needs to allow requests from your frontend.

**Update `backend/main.py`:**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development - in production, specify your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ... rest of your routes
```

### 3. Test Connection

#### Test Endpoint
```bash
curl https://your-app.up.railway.app/
```

Should return:
```json
{"message": "Welcome to the Bop Browse API"}
```

#### Test from Frontend
```javascript
const testConnection = async () => {
  try {
    const response = await fetch(`${apiUrl}/`);
    const data = await response.json();
    console.log('Backend connected:', data);
  } catch (error) {
    console.error('Backend connection failed:', error);
  }
};
```

### 4. Expo Configuration for Development

For testing on physical devices during development:

**Option A: Use ngrok for Local Testing**

```bash
# Install ngrok
npm install -g ngrok

# Start your backend locally
uvicorn main:app --host 0.0.0.0 --port 8000

# In another terminal, expose it
ngrok http 8000

# Use the ngrok URL in your frontend config
# https://abc123.ngrok.io
```

**Option B: Use Your Computer's IP**

```javascript
// Find your IP: ifconfig (macOS/Linux) or ipconfig (Windows)
const ENV = {
  dev: {
    apiUrl: 'http://192.168.1.X:8000',  // Your computer's local IP
  },
};
```

---

## Post-Deployment Tasks

### 1. Populate Database with Items

After deployment, sync items from Shopbop API:

```bash
python scripts/sync_items.py
```

This will:
- Fetch categories from Shopbop API
- Fetch items for each category
- Store items in your database

### 2. Generate Item Embeddings

Generate embeddings for recommendation system:

```bash
python scripts/update_item_embeddings.py
```

This creates 768-dimensional vectors for each item using sentence transformers.

### 3. Create Test User

```bash
# Via API (use your deployed URL)
curl -X POST https://your-app.up.railway.app/users/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass"}'
```

### 4. Health Check

Set up monitoring by checking:
```
GET https://your-app.up.railway.app/
```

---

## Troubleshooting

### Database Connection Issues

**Error**: `could not connect to server: Connection refused`

**Solutions**:
- Verify `DATABASE_URL` environment variable is set correctly
- Check if PostgreSQL service is running
- Ensure database credentials are correct
- Test connection: `psql $DATABASE_URL`

### pgvector Extension Not Found

**Error**: `type "vector" does not exist`

**Solution**:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

If you don't have permissions, contact your database provider or use a provider that supports pgvector (Railway, Render free tier).

### Migration Errors

**Error**: `Target database is not up to date`

**Solution**:
```bash
alembic upgrade head
```

**Error**: `Can't locate revision identified by 'XXXXX'`

**Solution**: Your migration history is out of sync. Reset:
```bash
alembic stamp head
```

### Port Already in Use

**Error**: `Address already in use`

**Solution**:
```bash
# Find process using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>

# Or use a different port
uvicorn main:app --port 8001
```

### CORS Errors in Frontend

**Error**: `Access to fetch blocked by CORS policy`

**Solution**: Make sure CORS middleware is added to `main.py` (see [Connecting Frontend](#2-add-cors-support-to-backend))

### 502 Bad Gateway (Railway/Render)

**Causes**:
- App crashed on startup
- Wrong start command
- Missing dependencies

**Solution**:
- Check deployment logs in Railway/Render dashboard
- Verify `requirements.txt` has all dependencies
- Ensure start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Frontend Can't Connect

**Checklist**:
- [ ] Backend is deployed and accessible via browser
- [ ] CORS is enabled in backend
- [ ] Frontend `apiUrl` matches deployed backend URL
- [ ] Backend uses `https://` (not `http://` for production)
- [ ] Test endpoint works: `curl <backend-url>/`

---

## Example API Testing

### Using Deployed Backend

```bash
# Base URL
export API_URL="https://your-app.up.railway.app"

# Test root endpoint
curl $API_URL/

# Create user
curl -X POST $API_URL/users/ \
  -H "Content-Type: application/json" \
  -d '{"username": "john", "password": "pass123"}'

# Get items feed
curl "$API_URL/items/feed?limit=10&offset=0"

# Get categories
curl $API_URL/categories/

# Like an item (replace user_id and item_id)
curl -X POST "$API_URL/likes/?user_id=1&item_id=ABC123"
```

---

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/dbname` |
| `PORT` | Auto | Port to run server (set by platform) | `8000` |

---

## Quick Start Checklist

- [ ] Set up PostgreSQL database with pgvector extension
- [ ] Set `DATABASE_URL` environment variable
- [ ] Deploy backend to chosen platform (Railway/Render/etc.)
- [ ] Run database migrations: `alembic upgrade head`
- [ ] Add CORS middleware to `main.py`
- [ ] Update frontend API configuration with deployed URL
- [ ] Test connection from frontend
- [ ] Populate database with items: `python scripts/sync_items.py`
- [ ] Generate embeddings: `python scripts/update_item_embeddings.py`
- [ ] Create test users and verify API endpoints

---

## Need Help?

- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **Railway Docs**: https://docs.railway.app/
- **Render Docs**: https://render.com/docs
- **Alembic Docs**: https://alembic.sqlalchemy.org/
- **pgvector**: https://github.com/pgvector/pgvector

---

**Good luck with your deployment! 🚀**
