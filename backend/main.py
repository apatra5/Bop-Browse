from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import user as user_router
from routers import category as category_router
from routers import items as items_router
from routers import likes as likes_router
from routers import outfit as outfit_router
from routers import dislikes as dislikes_router
from routers import preferences as preferences_router

app = FastAPI(title="Bop-Browse Backend")

# Add CORS middleware to allow requests from Expo mobile app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router.router)
app.include_router(category_router.router)
app.include_router(items_router.router)
app.include_router(likes_router.router)
app.include_router(outfit_router.router)
app.include_router(dislikes_router.router)
app.include_router(preferences_router.router)


@app.get("/", tags=["root"])
def read_root():
	return {"message": "Bop-Browse API"}
