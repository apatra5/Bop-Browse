# Bop-Browse
Build a Tinder like system for matching users with Shopbop outfits that they like. User creates a profile that stores their personalized data. They are then presented with either individual items or outfits comprised of multiple items from the Shopbop catalog and can swipe left or right to indicate they dislike or like that outfit, respectively.



## Development
### Backend

To run backend locally:
```bash
cd backend
uvicorn main:app --reload
```
API docs will be available at `http://localhost:8000/docs`

```bash
backend/
├─ alembic/       # database migration 
├─ core/          # global app config
│  └─ config.py   # load env vars, DB URL
├─ crud/          # data access logic
│  └─ user.py 
├─ db/            # database configuration setup
│  ├─ session.py
│  └─ base.py
├─ models/        # SQLAlchemy ORM models
│  └─ user.py
├─ routers/       # FastAPI routers
│  └─ (route modules, e.g. users.py)
├─ alembic.ini    # database migration
└─ main.py
```

#### Configurations

The backend expects a .env file placed in the backend/ folder so the application can import configuration settings at startup. The following variables are required: 
  - DATABASE_URL
 
#### Database Migration
Database migration ensures whenever we update the models, the changes can be automatically applied to the database. 

After making changes to the SQLAlchemy models, run the following scripts to sync changes to the AWS RDS database:

```bash
alembic revision --autogenerate -m "migration name (e.g. create user table)"
alembic upgrade head
```