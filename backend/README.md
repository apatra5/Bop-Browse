# Bop-Browse Backend

FastAPI-based backend for the Bop-Browse fashion browsing application.

## Quick Start

### 1. Install Dependencies
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Set Up Environment
```bash
cp .env.example .env
# Edit .env and set your DATABASE_URL
```

### 3. Set Up Database
```bash
# Create PostgreSQL database
createdb bopbrowse

# Enable pgvector extension
psql bopbrowse -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Run migrations
alembic upgrade head
```

### 4. Start Server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Visit:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs

## Deployment

**See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment instructions.**

The deployment guide covers:
- Deploying to Railway (recommended)
- Deploying to Render
- Docker deployment
- Connecting your frontend
- Database setup with pgvector
- Running migrations
- Troubleshooting

## Tech Stack

- **Framework**: FastAPI 0.100.0
- **Database**: PostgreSQL with pgvector extension
- **ORM**: SQLAlchemy 2.0.43
- **Migrations**: Alembic 1.16.5
- **Server**: Uvicorn
- **ML**: Sentence Transformers (for item embeddings)

## API Endpoints

- `GET /` - Health check
- `POST /users/` - Create user
- `GET /users/{user_id}` - Get user
- `GET /items/feed` - Get items feed
- `GET /items/category/{category_id}` - Get items by category
- `GET /categories/` - Get all categories
- `POST /likes/` - Like an item
- `GET /likes/{user_id}` - Get user's likes
- `POST /outfit/item/{item_id}` - Get outfit suggestions

Full API documentation: http://localhost:8000/docs

## Project Structure

```
backend/
├── main.py              # FastAPI app entry point
├── core/
│   └── config.py        # Configuration
├── db/
│   ├── base.py          # Database base
│   └── session.py       # Database session
├── models/              # SQLAlchemy models
├── schemas/             # Pydantic schemas
├── crud/                # Database operations
├── routers/             # API routes
├── services/            # External services (Shopbop API)
├── scripts/             # Utility scripts
└── alembic/             # Database migrations
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |

Example:
```
DATABASE_URL=postgresql://user:password@localhost:5432/bopbrowse
```

## Database

Requires PostgreSQL 14+ with the **pgvector** extension for storing item embeddings (768-dimensional vectors used for recommendations).

## Scripts

### Sync Items from Shopbop
```bash
python scripts/sync_items.py
```

### Generate Item Embeddings
```bash
python scripts/update_item_embeddings.py
```

## Development

### Create Migration
```bash
alembic revision --autogenerate -m "description"
```

### Apply Migrations
```bash
alembic upgrade head
```

### Rollback Migration
```bash
alembic downgrade -1
```

## Testing the API

```bash
# Health check
curl http://localhost:8000/

# Create user
curl -X POST http://localhost:8000/users/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass"}'

# Get items
curl http://localhost:8000/items/feed?limit=10
```

## Need Help?

- **Deployment Issues**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **API Documentation**: http://localhost:8000/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com/
