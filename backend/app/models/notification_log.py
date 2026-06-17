import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Enum, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base


class NotificationType(str, enum.Enum):
    DAILY_REMINDER = "daily_reminder"
    WEEKLY_REMINDER = "weekly_reminder"
    APPROVAL = "approval"
    REJECTION = "rejection"
    SYSTEM = "system"
    WELCOME = "welcome"
    PASSWORD_RESET = "password_reset"


class NotificationLog(Base):
    __tablename__ = "notification_log"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    recipient_id = Column(Integer, ForeignKey("user_master.id"), nullable=False, index=True)
    type = Column(Enum(NotificationType, values_callable=lambda x: [e.value for e in x]), nullable=False)
    subject = Column(String(255), nullable=False)
    body = Column(Text, nullable=True)
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    sent_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    read_at = Column(DateTime, nullable=True)

    recipient = relationship("User", foreign_keys=[recipient_id], back_populates="notifications")
