from fastapi import FastAPI

from routers import user as user_router
from routers import category as category_router
from routers import items as items_router
from routers import likes as likes_router
from routers import outfit as outfit_router
from routers import dislikes as dislikes_router

app = FastAPI(title="Bop-Browse Backend")

app.include_router(user_router.router)
app.include_router(category_router.router)
app.include_router(items_router.router)
app.include_router(likes_router.router)
app.include_router(outfit_router.router)
app.include_router(dislikes_router.router)


@app.get("/", tags=["root"])
def read_root():
	return {"message": "Bop-Browse API"}
