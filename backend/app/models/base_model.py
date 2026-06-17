from datetime import datetime, timezone
from sqlalchemy import Column, Integer, DateTime, Boolean
from app.database.base import Base


class AuditMixin:
    """Adds created_by/at and updated_by/at columns to any model."""
    created_by = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_by = Column(Integer, nullable=True)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    is_deleted = Column(Boolean, default=False, nullable=False, index=True)
