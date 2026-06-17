from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel
from app.models.project import ProjectStatus


class ProjectBase(BaseModel):
    project_name: str
    customer_name: str
    start_date: date
    end_date: Optional[date] = None
    description: Optional[str] = None
    project_manager_id: Optional[int] = None


class ProjectCreate(ProjectBase):
    project_code: str


class ProjectUpdate(BaseModel):
    project_name: Optional[str] = None
    customer_name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    description: Optional[str] = None
    project_manager_id: Optional[int] = None
    status: Optional[ProjectStatus] = None


class ProjectResponse(ProjectBase):
    id: int
    project_code: str
    status: ProjectStatus
    created_at: datetime
    manager_name: Optional[str] = None

    model_config = {"from_attributes": True}


class ProjectDropdown(BaseModel):
    id: int
    project_code: str
    project_name: str

    model_config = {"from_attributes": True}
