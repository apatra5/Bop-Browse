from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db.session import SessionLocal
from crud import user as crud_user
from schemas.user import UserCreate, UserOut, UserUpdate, UserBase

router = APIRouter(prefix="/users", tags=["users"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = crud_user.get_user_by_username(db, user_in.username)
    if existing:
        raise HTTPException(status_code=400, detail="Username already registered")
    user = crud_user.create_user(db, username=user_in.username, password=user_in.password)
    return user


@router.get("/{username}", response_model=UserOut)
def get_user(username: str, db: Session = Depends(get_db)):
    user = crud_user.get_user_by_username(db, username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/{username}", response_model=UserOut)
def update_user(username: str, user_in: UserUpdate, db: Session = Depends(get_db)):
    user = crud_user.get_user_by_username(db, username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # If changing username, ensure new username isn't taken
    if user_in.username and user_in.username != username:
        if crud_user.get_user_by_username(db, user_in.username):
            raise HTTPException(status_code=400, detail="New username already taken")

    updated = crud_user.update_user(db, user, username=user_in.username, password=user_in.password)
    return updated
