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
  """
  stored = _get_password_hash(password)
  db_user = User(
    username=username,
    hashed_password=stored,
    # add other fields if needed, e.g. is_active=True
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