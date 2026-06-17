from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime
from app.database.base import Base


class SystemConfig(Base):
    __tablename__ = "system_config"

    id = Column(Integer, primary_key=True, autoincrement=True)
    config_key = Column(String(100), unique=True, nullable=False, index=True)
    config_value = Column(String(500), nullable=False)
    description = Column(String(300), nullable=True)
    updated_by = Column(Integer, nullable=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc), nullable=False)
