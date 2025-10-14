from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from db.base import Base
from .associations import item_outfit

class Outfit(Base):
    __tablename__ = "outfits"
    id = Column(String, primary_key=True, index=True)

    items = relationship("Item", secondary=item_outfit, back_populates="outfits")
