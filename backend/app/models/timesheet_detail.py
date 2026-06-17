from sqlalchemy import Column, Integer, Date, DECIMAL, Text, Boolean, ForeignKey, String
from sqlalchemy.orm import relationship
from app.database.base import Base
from app.models.base_model import AuditMixin


class TimesheetDetail(Base, AuditMixin):
    __tablename__ = "timesheet_detail"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    header_id = Column(Integer, ForeignKey("timesheet_header.id", ondelete="CASCADE"), nullable=False, index=True)
    employee_id = Column(Integer, ForeignKey("user_master.id"), nullable=False, index=True)
    project_id = Column(Integer, ForeignKey("project_master.id"), nullable=False, index=True)
    activity_id = Column(Integer, ForeignKey("activity_master.id"), nullable=False, index=True)
    work_date = Column(Date, nullable=False, index=True)
    hours_worked = Column(DECIMAL(4, 2), nullable=False)
    description = Column(Text, nullable=True)
    is_billable = Column(Boolean, default=True, nullable=False)

    header = relationship("TimesheetHeader", back_populates="details")
    employee = relationship("User", foreign_keys=[employee_id])
    project = relationship("Project", back_populates="timesheet_details")
    activity = relationship("Activity", back_populates="timesheet_details")
