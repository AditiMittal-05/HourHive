import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Enum, Text, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship
from app.database.base import Base


class ApprovalAction(str, enum.Enum):
    SUBMIT = "submit"
    APPROVE = "approve"
    REJECT = "reject"
    UNLOCK = "unlock"
    RESUBMIT = "resubmit"


class ApprovalHistory(Base):
    """Immutable approval trail — no soft delete, no update columns."""
    __tablename__ = "approval_history"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    header_id = Column(Integer, ForeignKey("timesheet_header.id", ondelete="CASCADE"), nullable=False, index=True)
    action_by = Column(Integer, ForeignKey("user_master.id"), nullable=False, index=True)
    action = Column(Enum(ApprovalAction, values_callable=lambda x: [e.value for e in x]), nullable=False)
    comment = Column(Text, nullable=True)
    previous_status = Column(String(20), nullable=True)
    new_status = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    header = relationship("TimesheetHeader", back_populates="approval_history")
    actor = relationship("User", foreign_keys=[action_by])
