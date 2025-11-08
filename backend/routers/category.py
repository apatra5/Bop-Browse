from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db.session import SessionLocal
from crud import category as crud_category
from schemas.category import CategoryOut

router = APIRouter(prefix="/categories", tags=["categories"])


def get_db():
	db = SessionLocal()
	try:
		yield db
	finally:
		db.close()


@router.get("/{category_id}", response_model=CategoryOut)
def read_category(category_id: str, db: Session = Depends(get_db)):
	category = crud_category.get_category(db, category_id)
	if not category:
		raise HTTPException(status_code=404, detail="Category not found")
	return category

@router.get("/", response_model=list[CategoryOut])
def get_all_categories(db: Session = Depends(get_db)):
	categories = crud_category.get_all_categories(db)
	return categories