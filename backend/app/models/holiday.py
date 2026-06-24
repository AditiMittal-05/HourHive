from sqlalchemy import Column, Integer, String, Date
from app.database.base import Base
from app.models.base_model import AuditMixin


class Holiday(Base, AuditMixin):
    __tablename__ = "holiday_master"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    date = Column(Date, nullable=False, index=True)
    name = Column(String(200), nullable=False)
    year = Column(Integer, nullable=False, index=True)
