import enum
from sqlalchemy import Column, Integer, String, Enum, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.base import Base
from app.models.base_model import AuditMixin


class ProjectStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    COMPLETED = "completed"
    ON_HOLD = "on_hold"


class Project(Base, AuditMixin):
    __tablename__ = "project_master"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    project_code = Column(String(20), unique=True, nullable=False, index=True)
    project_name = Column(String(200), nullable=False)
    customer_name = Column(String(200), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    status = Column(Enum(ProjectStatus, values_callable=lambda x: [e.value for e in x]), default=ProjectStatus.ACTIVE, nullable=False, index=True)
    project_manager_id = Column(Integer, ForeignKey("user_master.id"), nullable=True)
    description = Column(Text, nullable=True)

    project_manager = relationship("User", foreign_keys=[project_manager_id], back_populates="managed_projects")
    timesheet_details = relationship("TimesheetDetail", back_populates="project")
