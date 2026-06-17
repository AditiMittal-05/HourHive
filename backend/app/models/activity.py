import enum
from sqlalchemy import Column, Integer, String, Enum, Boolean
from sqlalchemy.orm import relationship
from app.database.base import Base
from app.models.base_model import AuditMixin


class ActivityStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class Activity(Base, AuditMixin):
    __tablename__ = "activity_master"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    activity_code = Column(String(20), unique=True, nullable=False, index=True)
    activity_name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=True)
    is_billable = Column(Boolean, default=True, nullable=False)
    status = Column(Enum(ActivityStatus, values_callable=lambda x: [e.value for e in x]), default=ActivityStatus.ACTIVE, nullable=False)

    timesheet_details = relationship("TimesheetDetail", back_populates="activity")
