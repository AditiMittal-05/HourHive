from datetime import datetime, timezone
from sqlalchemy import Column, BigInteger, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.base import Base


class AuditLog(Base):
    """Append-only, immutable audit trail."""
    __tablename__ = "audit_log"

    id = Column(BigInteger, primary_key=True, autoincrement=True, index=True)
    user_id = Column(Integer, ForeignKey("user_master.id"), nullable=True, index=True)
    entity_type = Column(String(50), nullable=False, index=True)
    entity_id = Column(Integer, nullable=True, index=True)
    action = Column(String(20), nullable=False)
    old_values = Column(JSON, nullable=True)
    new_values = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    actor = relationship("User", foreign_keys=[user_id])
