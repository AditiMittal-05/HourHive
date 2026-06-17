import enum
from sqlalchemy import Column, Integer, Enum, Date, DateTime, Boolean, DECIMAL, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.base import Base
from app.models.base_model import AuditMixin


class TimesheetStatus(str, enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    APPROVED = "approved"
    REJECTED = "rejected"
    RESUBMITTED = "resubmitted"


class TimesheetHeader(Base, AuditMixin):
    __tablename__ = "timesheet_header"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    employee_id = Column(Integer, ForeignKey("user_master.id"), nullable=False, index=True)
    week_start_date = Column(Date, nullable=False)
    week_end_date = Column(Date, nullable=False)
    total_hours = Column(DECIMAL(5, 2), default=0, nullable=False)
    status = Column(Enum(TimesheetStatus, values_callable=lambda x: [e.value for e in x]), default=TimesheetStatus.DRAFT, nullable=False, index=True)
    submitted_at = Column(DateTime, nullable=True)
    approved_by = Column(Integer, ForeignKey("user_master.id"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    rejected_by = Column(Integer, ForeignKey("user_master.id"), nullable=True)
    rejection_reason = Column(Text, nullable=True)
    is_locked = Column(Boolean, default=False, nullable=False)

    employee = relationship("User", foreign_keys=[employee_id], back_populates="timesheet_headers")
    approver = relationship("User", foreign_keys=[approved_by])
    rejecter = relationship("User", foreign_keys=[rejected_by])
    details = relationship("TimesheetDetail", back_populates="header", cascade="all, delete-orphan")
    approval_history = relationship("ApprovalHistory", back_populates="header", cascade="all, delete-orphan")
