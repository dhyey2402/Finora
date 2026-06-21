from sqlalchemy import Column, Integer, String
from app.database.db import Base

class Ledger(Base):
    __tablename__ = "ledgers"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)