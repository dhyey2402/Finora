from sqlalchemy import Column, Integer, String
from app.database.db import Base

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)