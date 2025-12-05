from typing import Optional
from sqlalchemy.orm import Session
import hashlib

from models.user import User   


def _verify_password(plain_password: str, stored_password: str) -> bool:
  """Return True if plain_password matches stored_password (md5 hash comparison)."""
  if stored_password is None:
    return False
  return _get_password_hash(plain_password) == stored_password


def _get_password_hash(password: str) -> str:
  """Return the md5 hex digest of the password."""
  return hashlib.md5(password.encode("utf-8")).hexdigest()


def get_user_by_username(db: Session, username: str) -> Optional[User]:
  """Lookup a user by username."""
  return db.query(User).filter(User.username == username).first()


def create_user(db: Session, username: str, password: str) -> User:
  """
  Create a new user from raw fields (no Pydantic schema).
  Expects:
    - username: str
    - password: plaintext str (will be stored as md5 hash)
  The model is expected to have a `hashed_password` column; here it stores md5 hash.
  New users are created with is_new_user=True by default.
  """
  stored = _get_password_hash(password)
  db_user = User(
    username=username,
    hashed_password=stored,
    is_new_user=True,
  )
  db.add(db_user)
  db.commit()
  db.refresh(db_user)
  return db_user


def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
  """
  Validate username/password.
  Returns the user on success, or None on failure.
  """
  user = get_user_by_username(db, username)
  if not user:
    return None
  if not _verify_password(password, user.hashed_password):
    return None
  return user


def update_user(db: Session, user: User, username: Optional[str] = None, password: Optional[str] = None, is_new_user: Optional[bool] = None) -> User:
  """Update user's username, password, and/or is_new_user flag. Password will be stored as md5 hash."""
  changed = False
  if username is not None and username != user.username:
    user.username = username
    changed = True
  if password is not None:
    user.hashed_password = _get_password_hash(password)
    changed = True
  if is_new_user is not None and is_new_user != user.is_new_user:
    user.is_new_user = is_new_user
    changed = True
  if changed:
    db.add(user)
    db.commit()
    db.refresh(user)
  return user


if __name__ == "__main__":
  # test code
  from db.session import SessionLocal
  db = SessionLocal()

  # Create a user
  user = create_user(db, "testuser", "testpassword")
  print(f"Created user: {user.username}")

  # Authenticate the user
  auth_user = authenticate_user(db, "testuser", "testpassword")
  if auth_user:
    print(f"Authenticated user: {auth_user.username}")
  else:
    print("Authentication failed")